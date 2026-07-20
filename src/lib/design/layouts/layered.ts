/**
 * Layered graph layout, shared by the concrete layouts (vertical / horizontal).
 * Nodes get a "layer" = longest dependency depth from a source node; each layer
 * is a line perpendicular to the flow, centred. Cycle-safe.
 *
 * Nodes may carry real (measured) sizes; without them the defaults apply.
 * Layers are centred on the cross axis using per-node sizes, so nodes of
 * different heights still line up on their centres — where edges attach.
 */
export type Orientation = 'vertical' | 'horizontal';

const NODE_W = 260;
const NODE_H = 150;
const GAP_MAIN = 90; // between layers (along the flow)
const GAP_CROSS_V = 70; // between siblings, vertical flow
const GAP_CROSS_H = 45; // between siblings, horizontal flow

type MinNode = { id?: string; width?: number; height?: number };
type MinEdge = { source: string; target: string };

export function layeredLayout(
	nodes: MinNode[],
	edges: MinEdge[],
	orientation: Orientation
): Map<string, { x: number; y: number }> {
	const ids = nodes.map((n, i) => n.id ?? `n${i}`);
	const idSet = new Set(ids);

	const sizes = new Map<string, { w: number; h: number }>();
	nodes.forEach((n, i) => {
		sizes.set(ids[i], { w: n.width ?? NODE_W, h: n.height ?? NODE_H });
	});

	const outgoing = new Map<string, string[]>();
	const indeg = new Map<string, number>();
	ids.forEach((id) => {
		outgoing.set(id, []);
		indeg.set(id, 0);
	});
	for (const e of edges) {
		if (!idSet.has(e.source) || !idSet.has(e.target) || e.source === e.target) {
			continue;
		}
		outgoing.get(e.source)!.push(e.target);
		indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
	}

	// Topological order, then longest-path layering.
	const order: string[] = [];
	const q = ids.filter((id) => (indeg.get(id) ?? 0) === 0);
	const work = new Map(indeg);
	const seen = new Set<string>();
	while (q.length) {
		const id = q.shift()!;
		if (seen.has(id)) {
			continue;
		}
		seen.add(id);
		order.push(id);
		for (const t of outgoing.get(id) ?? []) {
			work.set(t, (work.get(t) ?? 0) - 1);
			if ((work.get(t) ?? 0) <= 0) {
				q.push(t);
			}
		}
	}
	for (const id of ids) {
		if (!seen.has(id)) {
			order.push(id);
		}
	}

	const layer = new Map<string, number>();
	ids.forEach((id) => layer.set(id, 0));
	for (const id of order) {
		const base = layer.get(id) ?? 0;
		for (const t of outgoing.get(id) ?? []) {
			layer.set(t, Math.max(layer.get(t) ?? 0, base + 1));
		}
	}

	const perLayer = new Map<number, string[]>();
	ids.forEach((id) => {
		const l = layer.get(id) ?? 0;
		if (!perLayer.has(l)) {
			perLayer.set(l, []);
		}
		perLayer.get(l)!.push(id);
	});

	const vertical = orientation === 'vertical';
	const gapCross = vertical ? GAP_CROSS_V : GAP_CROSS_H;
	const mainSize = (id: string) => (vertical ? sizes.get(id)!.h : sizes.get(id)!.w);
	const crossSize = (id: string) => (vertical ? sizes.get(id)!.w : sizes.get(id)!.h);

	const positions = new Map<string, { x: number; y: number }>();
	let main = 0;
	for (const l of [...perLayer.keys()].sort((a, b) => a - b)) {
		const sibs = perLayer.get(l)!;
		const span = sibs.reduce((sum, id) => sum + crossSize(id), 0) + (sibs.length - 1) * gapCross;
		let cross = -span / 2;
		for (const id of sibs) {
			positions.set(id, vertical ? { x: cross, y: main } : { x: main, y: cross });
			cross += crossSize(id) + gapCross;
		}
		main += Math.max(...sibs.map(mainSize)) + GAP_MAIN;
	}
	return positions;
}
