import type { Writable } from 'svelte/store';
import type { Node, Edge } from '@xyflow/svelte';

export type Enhancers = Array<(controller: KybaInterface) => () => void>;

export type HooksCallback = (controller: KybaInterface) => void;

export type SubscriptionProps = {
	[name: string]: Array<HooksCallback>;
};

export type KybaInterface = {
	nodes: Writable<Node[]>;
	edges: Writable<Edge[]>;
	container: HTMLElement | null;
	panEnabled: Writable<boolean>;
	sub: (name: string, callback: HooksCallback) => void;
	dispatch: (name: string) => void;
	addNode: (node: Omit<Node, 'id'>) => string;
	addEdge: (edge: Omit<Edge, 'id'>) => string;
	getNodeCount: () => number;
	getEdgeCount: () => number;
};

export type Hooks = [string, HooksCallback];

export type KybaOptions = {
	container: HTMLElement;
	enhancers: Enhancers;
	hooks?: Hooks[];
};
