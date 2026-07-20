import type { Edge, Node } from '@xyflow/svelte';
import { getDefaultMetrics, MODULES } from '$lib/modules';
import { getLayout, DEFAULT_LAYOUT } from '$lib/design/layouts';
import { DESIGN_VERSION, type DesignNode, type SystemDesign } from '$lib/design/schema';

/**
 * Pure conversions between the live canvas state (xyflow Node/Edge) and the
 * portable SystemDesign document. This is the seam the MCP will call:
 * an AI produces a SystemDesign → `hydrateDesign` → nodes/edges → canvas.
 */

const round = (n: number) => Math.round(n * 100) / 100;

/** Keep only metric values that differ from the module defaults. */
const minimalMetrics = (
	type: string,
	metrics: Record<string, number> | undefined
): Record<string, number> | undefined => {
	if (!metrics) return undefined;
	const defaults = getDefaultMetrics(type);
	const out: Record<string, number> = {};
	for (const [k, v] of Object.entries(metrics)) {
		if (v !== defaults[k]) out[k] = v;
	}
	return Object.keys(out).length ? out : undefined;
};

export type DesignMeta = {
	id?: string;
	name?: string;
	createdAt?: number;
	updatedAt?: number;
	viewport?: { x: number; y: number; zoom: number };
};

/** Canvas → portable document (minimal: omits defaults, rounds positions). */
export function serializeDesign(nodes: Node[], edges: Edge[], meta: DesignMeta = {}): SystemDesign {
	return {
		version: DESIGN_VERSION,
		id: meta.id,
		name: meta.name,
		createdAt: meta.createdAt,
		updatedAt: meta.updatedAt,
		viewport: meta.viewport,
		nodes: nodes.map((n) => {
			const dn: DesignNode = {
				id: n.id,
				type: n.type as string,
				position: { x: round(n.position.x), y: round(n.position.y) }
			};
			const metrics = minimalMetrics(n.type as string, n.data?.metrics as Record<string, number>);
			if (metrics) dn.metrics = metrics;
			return dn;
		}),
		edges: edges.map((e) => ({
			id: e.id,
			source: e.source,
			target: e.target,
			sourceHandle: e.sourceHandle ?? undefined,
			targetHandle: e.targetHandle ?? undefined
		}))
	};
}

/**
 * Portable document → canvas nodes/edges. Fills ids, defaults, and — when any
 * position is missing — runs the chosen layout (default: vertical). The layout
 * also decides the default edge-handle direction.
 */
export function hydrateDesign(
	design: SystemDesign,
	layoutId: string = DEFAULT_LAYOUT
): { nodes: Node[]; edges: Edge[] } {
	const def = getLayout(layoutId);

	// Assign ids to any node missing one (keeps type-prefixed, unique).
	const typeCounts: Record<string, number> = {};
	const withIds = design.nodes
		.filter((n) => MODULES[n.type])
		.map((n) => {
			const id = n.id ?? `${n.type}-${(typeCounts[n.type] = (typeCounts[n.type] ?? 0) + 1)}`;
			return { ...n, id };
		});

	// Lay out when any position is missing (AI-authored configs).
	const needsLayout = withIds.some((n) => !n.position);
	const layout = needsLayout ? def.layout(withIds, design.edges) : null;

	const nodes: Node[] = withIds.map((n) => ({
		id: n.id,
		type: n.type,
		position: n.position ?? layout?.get(n.id) ?? { x: 0, y: 0 },
		data: { metrics: { ...getDefaultMetrics(n.type), ...(n.metrics ?? {}) } }
	}));

	const idSet = new Set(nodes.map((n) => n.id));
	const edges: Edge[] = design.edges
		.filter((e) => idSet.has(e.source) && idSet.has(e.target))
		.map((e, i) => ({
			id: e.id ?? `edge-${e.source}-${e.target}-${i}`,
			type: 'default',
			source: e.source,
			target: e.target,
			// Default to real ports from the layout when handles are omitted, so
			// edges attach to actual handles and pick up connected styling.
			sourceHandle: e.sourceHandle ?? def.sourceHandle,
			targetHandle: e.targetHandle ?? def.targetHandle
		}));

	return { nodes, edges };
}
