import BlockNode from '$components/arena/blocks/BlockNode.svelte';
import ShapeNode from '$components/arena/blocks/ShapeNode.svelte';
import AnimatedEdge from '$components/arena/edges/AnimatedEdge.svelte';
import { MODULES, getDefaultMetrics } from '$lib/modules';
import { SHAPES } from '$lib/shapes';
import type { LayoutDef } from '$lib/design/layouts';

import type { Component } from 'svelte';
import type { Edge, Node } from '@xyflow/svelte';
import type { NodeProps, EdgeProps } from '@xyflow/svelte';

type NodeTypes = Record<string, Component<NodeProps>>;
type EdgeTypes = Record<string, Component<EdgeProps>>;

// Modules render through the registry-driven BlockNode; blank shapes through
// the geometry-only ShapeNode. Both share the same node-type registry.
const buildNodeTypes = (): NodeTypes => ({
	...Object.fromEntries(Object.keys(MODULES).map((type) => [type, BlockNode])),
	...Object.fromEntries(Object.keys(SHAPES).map((type) => [type, ShapeNode]))
});

export class DrawState {
	container: HTMLDivElement | null = null;
	nodes = $state.raw<Node[]>([]);
	edges = $state.raw<Edge[]>([]);
	panEnabled = $state<boolean>(true);
	private nodeSeq = 0;

	nodeTypes: NodeTypes = buildNodeTypes();
	edgeTypes: EdgeTypes = { default: AnimatedEdge };

	/** Replace the whole graph (used when restoring / loading a design). */
	loadGraph = (nodes: Node[], edges: Edge[]) => {
		this.nodes = nodes;
		this.edges = edges;
		// Advance the id counter past any restored ids to prevent collisions.
		let max = -1;
		for (const n of nodes) {
			const m = /-(\d+)$/.exec(n.id);
			if (m) {
				max = Math.max(max, Number(m[1]));
			}
		}
		this.nodeSeq = max + 1;
	};

	/** Re-position the current graph with the given layout and re-orient edges. */
	applyLayout = (def: LayoutDef) => {
		const positions = def.layout(
			this.nodes.map((n) => ({
				id: n.id,
				width: n.measured?.width ?? n.width,
				height: n.measured?.height ?? n.height
			})),
			this.edges
		);
		this.nodes = this.nodes.map((n) => ({ ...n, position: positions.get(n.id) ?? n.position }));
		this.edges = this.edges.map((e) => ({
			...e,
			sourceHandle: def.sourceHandle,
			targetHandle: def.targetHandle
		}));
	};

	clearGraph = () => {
		this.nodes = [];
		this.edges = [];
		this.nodeSeq = 0;
	};

	/** Drop a node of any registered module type at (x, y). */
	addNode = (type: string, x: number, y: number) => {
		if (!MODULES[type]) {
			return;
		}
		this.nodes = [
			...this.nodes,
			{
				id: `${type}-${this.nodeSeq++}`,
				type,
				position: { x, y },
				data: { metrics: getDefaultMetrics(type) }
			}
		];
	};

	/** Drop a blank shape node (geometry + editable label) at (x, y). */
	addShape = (type: string, x: number, y: number) => {
		const def = SHAPES[type];
		if (!def) {
			return;
		}
		this.nodes = [
			...this.nodes,
			{
				id: `${type}-${this.nodeSeq++}`,
				type,
				position: { x, y },
				data: { label: def.label }
			}
		];
	};

	/** Place any palette item — module or blank shape — at (x, y). */
	create = (type: string, x: number, y: number) => {
		if (SHAPES[type]) {
			this.addShape(type, x, y);
		} else {
			this.addNode(type, x, y);
		}
	};

	/** Shallow-merge a patch into a node's `data` (e.g. a shape's label). */
	updateNodeData = (id: string, patch: Record<string, unknown>) => {
		this.nodes = this.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
	};

	/**
	 * Release the transient container reference on unmount. The graph itself is
	 * a session singleton and is intentionally NOT cleared here, so in-app
	 * navigation (e.g. Arena → Explore → back) preserves the working design.
	 * Use `clearGraph()` to actually empty the canvas.
	 */
	destroy = () => {
		this.container = null;
	};
}

export const drawState = new DrawState();
