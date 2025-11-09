import Client from '$components/blocks/Client.svelte';
import Server from '$components/blocks/Server.svelte';

import type { Component } from 'svelte';
import type { Edge, Node } from '@xyflow/svelte';
import type { NodeProps, EdgeProps } from '@xyflow/svelte';

type NodeTypes = Record<string, Component<NodeProps>>;
type EdgeTypes = Record<string, Component<EdgeProps>>;

export class DrawStateClass {
	container: HTMLDivElement | null = null;
	nodes = $state.raw<Node[]>([]);
	edges = $state.raw<Edge[]>([]);
	panEnabled = $state<boolean>(true);

	nodeTypes: NodeTypes = {
		client: Client,
		server: Server
	};

	edgeTypes: EdgeTypes = {};

	setContainer = (container: HTMLDivElement) => {
		this.container = container;
	};

	getContainer = () => {
		return this.container;
	};

	addClientNode = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `client-${this.nodes.length}`,
				type: 'client',
				position: { x, y },
				data: { metrics: 24 }
			}
		];
	};

	addServerNode = (x: number, y: number) => {
		this.nodes = [
			...this.nodes,
			{
				id: `server-${this.nodes.length}`,
				type: 'server',
				position: { x, y },
				data: { metrics: 54 }
			}
		];
	};

	destroy = () => {
		this.container = null;
		this.nodes = [];
		this.edges = [];
		this.panEnabled = true;
		this.nodeTypes = {};
		this.edgeTypes = {};
	};
}

export const drawState = new DrawStateClass();
