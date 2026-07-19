import { MODULES } from '$lib/modules';

/**
 * SystemSage design document — the portable, declarative representation of a
 * system drawn on the canvas. This is the single interchange format shared by:
 *   • the canvas         (serialize ⇄ hydrate)
 *   • local persistence  (IndexedDB autosave)
 *   • sharing            (URL hash / JSON export)
 *   • the future MCP     (an AI emits this JSON to draw a system)
 *
 * Design principles:
 *   • Minimal — positions and default-valued metrics are omitted.
 *   • Forgiving — an author may provide only { type } for a node; everything
 *     else (id, position, metrics) is filled in on hydrate.
 *   • Versioned — `version` lets us migrate old documents.
 */

export const DESIGN_VERSION = 1 as const;

export type DesignNode = {
	/** Stable id. If omitted by an author, one is generated on hydrate. */
	id?: string;
	/** Module type — a key of the module registry (client, server, db, cache, …). */
	type: string;
	/** Canvas position. Omit to let the layout engine place it. */
	position?: { x: number; y: number };
	/** Metric overrides. Only values that differ from the module defaults. */
	metrics?: Record<string, number>;
	/** Optional custom label (reserved for future use). */
	label?: string;
};

export type DesignEdge = {
	/** Stable id. Generated on hydrate if omitted. */
	id?: string;
	source: string;
	target: string;
	sourceHandle?: string;
	targetHandle?: string;
};

export type SystemDesign = {
	version: number;
	/** Stable document id. */
	id?: string;
	/** Human title, shown in the header. */
	name?: string;
	createdAt?: number;
	updatedAt?: number;
	nodes: DesignNode[];
	edges: DesignEdge[];
	/** Optional saved camera. */
	viewport?: { x: number; y: number; zoom: number };
};

export type ParseResult = { ok: true; design: SystemDesign } | { ok: false; error: string };

const isObj = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v);

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Validate and normalize an untrusted value into a SystemDesign.
 * Returns a precise error string on failure (surfaced to imports / MCP).
 */
export function parseDesign(input: unknown): ParseResult {
	if (!isObj(input)) return { ok: false, error: 'Design must be an object.' };
	if (input.version !== undefined && !isNum(input.version)) {
		return { ok: false, error: '`version` must be a number.' };
	}
	if (!Array.isArray(input.nodes)) return { ok: false, error: '`nodes` must be an array.' };
	if (input.edges !== undefined && !Array.isArray(input.edges)) {
		return { ok: false, error: '`edges` must be an array.' };
	}

	const ids = new Set<string>();
	const nodes: DesignNode[] = [];

	for (let i = 0; i < input.nodes.length; i++) {
		const n = input.nodes[i];
		if (!isObj(n)) return { ok: false, error: `nodes[${i}] must be an object.` };
		if (typeof n.type !== 'string') return { ok: false, error: `nodes[${i}].type is required.` };
		if (!MODULES[n.type]) {
			return {
				ok: false,
				error: `nodes[${i}].type "${n.type}" is not a known module. Valid types: ${Object.keys(MODULES).join(', ')}.`
			};
		}
		if (n.id !== undefined && typeof n.id !== 'string') {
			return { ok: false, error: `nodes[${i}].id must be a string.` };
		}
		if (n.id) {
			if (ids.has(n.id)) return { ok: false, error: `Duplicate node id "${n.id}".` };
			ids.add(n.id);
		}
		let position: DesignNode['position'];
		if (n.position !== undefined) {
			if (!isObj(n.position) || !isNum(n.position.x) || !isNum(n.position.y)) {
				return { ok: false, error: `nodes[${i}].position must be { x, y } numbers.` };
			}
			position = { x: n.position.x, y: n.position.y };
		}
		let metrics: Record<string, number> | undefined;
		if (n.metrics !== undefined) {
			if (!isObj(n.metrics)) return { ok: false, error: `nodes[${i}].metrics must be an object.` };
			metrics = {};
			for (const [k, v] of Object.entries(n.metrics)) {
				if (!isNum(v)) return { ok: false, error: `nodes[${i}].metrics.${k} must be a number.` };
				metrics[k] = v;
			}
		}
		nodes.push({
			id: n.id,
			type: n.type,
			position,
			metrics,
			label: typeof n.label === 'string' ? n.label : undefined
		});
	}

	const edges: DesignEdge[] = [];
	const rawEdges = (input.edges as unknown[]) ?? [];
	for (let i = 0; i < rawEdges.length; i++) {
		const e = rawEdges[i];
		if (!isObj(e)) return { ok: false, error: `edges[${i}] must be an object.` };
		if (typeof e.source !== 'string' || typeof e.target !== 'string') {
			return { ok: false, error: `edges[${i}] needs string source and target.` };
		}
		// Referential integrity only enforced when node ids were explicit.
		if (ids.size > 0) {
			if (!ids.has(e.source))
				return { ok: false, error: `edges[${i}].source "${e.source}" has no matching node.` };
			if (!ids.has(e.target))
				return { ok: false, error: `edges[${i}].target "${e.target}" has no matching node.` };
		}
		edges.push({
			id: typeof e.id === 'string' ? e.id : undefined,
			source: e.source,
			target: e.target,
			sourceHandle: typeof e.sourceHandle === 'string' ? e.sourceHandle : undefined,
			targetHandle: typeof e.targetHandle === 'string' ? e.targetHandle : undefined
		});
	}

	return {
		ok: true,
		design: {
			version: isNum(input.version) ? input.version : DESIGN_VERSION,
			id: typeof input.id === 'string' ? input.id : undefined,
			name: typeof input.name === 'string' ? input.name : undefined,
			createdAt: isNum(input.createdAt) ? input.createdAt : undefined,
			updatedAt: isNum(input.updatedAt) ? input.updatedAt : undefined,
			nodes,
			edges,
			viewport:
				isObj(input.viewport) &&
				isNum(input.viewport.x) &&
				isNum(input.viewport.y) &&
				isNum(input.viewport.zoom)
					? { x: input.viewport.x, y: input.viewport.y, zoom: input.viewport.zoom }
					: undefined
		}
	};
}
