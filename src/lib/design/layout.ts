import type { DesignEdge, DesignNode } from '$lib/design/schema';

/**
 * Layered left→right auto-layout for designs authored without positions
 * (e.g. an MCP/AI emits nodes + edges and lets the app place them).
 *
 * Nodes are assigned a "layer" = longest dependency depth from a source node,
 * then stacked vertically within their layer. Cycle-safe.
 */

const NODE_W = 260;
const NODE_H = 130;
const GAP_X = 90;
const GAP_Y = 40;

export function autoLayout(
	nodes: DesignNode[],
	edges: DesignEdge[]
): Map<string, { x: number; y: number }> {
	const ids = nodes.map((n, i) => n.id ?? `n${i}`);
	const idSet = new Set(ids);

	const outgoing = new Map<string, string[]>();
	const indeg = new Map<string, number>();
	ids.forEach((id) => {
		outgoing.set(id, []);
		indeg.set(id, 0);
	});
	for (const e of edges) {
		if (!idSet.has(e.source) || !idSet.has(e.target) || e.source === e.target) continue;
		outgoing.get(e.source)!.push(e.target);
		indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
	}

	const layer = new Map<string, number>();

	// Kahn-style topological order, then longest-path layering over it.
	const order: string[] = [];
	const q: string[] = ids.filter((id) => (indeg.get(id) ?? 0) === 0);
	const indegWork = new Map(indeg);
	const seen = new Set<string>();
	while (q.length) {
		const id = q.shift()!;
		if (seen.has(id)) continue;
		seen.add(id);
		order.push(id);
		for (const t of outgoing.get(id) ?? []) {
			indegWork.set(t, (indegWork.get(t) ?? 0) - 1);
			if ((indegWork.get(t) ?? 0) <= 0) q.push(t);
		}
	}
	// Any nodes left (cycles) get appended.
	for (const id of ids) if (!seen.has(id)) order.push(id);

	ids.forEach((id) => layer.set(id, 0));
	for (const id of order) {
		const base = layer.get(id) ?? 0;
		for (const t of outgoing.get(id) ?? []) {
			layer.set(t, Math.max(layer.get(t) ?? 0, base + 1));
		}
	}

	// Stack nodes vertically within each layer.
	const perLayer = new Map<number, string[]>();
	ids.forEach((id) => {
		const l = layer.get(id) ?? 0;
		if (!perLayer.has(l)) perLayer.set(l, []);
		perLayer.get(l)!.push(id);
	});

	const positions = new Map<string, { x: number; y: number }>();
	for (const [l, colIds] of perLayer) {
		const colHeight = colIds.length * NODE_H + (colIds.length - 1) * GAP_Y;
		colIds.forEach((id, row) => {
			positions.set(id, {
				x: l * (NODE_W + GAP_X),
				y: row * (NODE_H + GAP_Y) - colHeight / 2
			});
		});
	}

	return positions;
}
