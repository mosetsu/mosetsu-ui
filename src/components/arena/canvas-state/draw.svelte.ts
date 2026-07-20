import BlockNode from '$components/arena/blocks/BlockNode.svelte';
import AnimatedEdge from '$components/arena/edges/AnimatedEdge.svelte';
import { MODULES, getDefaultMetrics } from '$lib/modules';
import type { LayoutDef } from '$lib/design/layouts';

import type { Component } from 'svelte';
import type { Edge, Node } from '@xyflow/svelte';
import type { NodeProps, EdgeProps } from '@xyflow/svelte';

type NodeTypes = Record<string, Component<NodeProps>>;
type EdgeTypes = Record<string, Component<EdgeProps>>;

// Every module renders through the generic, registry-driven BlockNode.
const buildNodeTypes = (): NodeTypes =>
	Object.keys(MODULES).reduce((acc, type) => {
		acc[type] = BlockNode;
		return acc;
	}, {} as NodeTypes);

export class DrawStateClass {
	container: HTMLDivElement | null = null;
	nodes = $state.raw<Node[]>([]);
	edges = $state.raw<Edge[]>([]);
	panEnabled = $state<boolean>(true);
	private nodeSeq = 0;

	nodeTypes: NodeTypes = buildNodeTypes();

	edgeTypes: EdgeTypes = {
		default: AnimatedEdge
	};

	setContainer = (container: HTMLDivElement) => {
		this.container = container;
	};

	getContainer = () => {
		return this.container;
	};

	/** Replace the whole graph (used when restoring / loading a design). */
	loadGraph = (nodes: Node[], edges: Edge[]) => {
		this.nodes = nodes;
		this.edges = edges;
		// Advance the id counter past any restored ids to prevent collisions.
		let max = -1;
		for (const n of nodes) {
			const m = /-(\d+)$/.exec(n.id);
			if (m) max = Math.max(max, Number(m[1]));
		}
		this.nodeSeq = max + 1;
	};

	/** Re-position the current graph with the given layout and re-orient edges. */
	applyLayout = (def: LayoutDef) => {
		const positions = def.layout(this.nodes, this.edges);
		this.nodes = this.nodes.map((n) => ({ ...n, position: positions.get(n.id) ?? n.position }));
		this.edges = this.edges.map((e) => ({
			...e,
			sourceHandle: def.sourceHandle,
			targetHandle: def.targetHandle
		}));
	};

	/** Clear the canvas. */
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

export const drawState = new DrawStateClass();
