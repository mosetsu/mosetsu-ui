import { writable } from 'svelte/store';
import type { Node, Edge } from '@xyflow/svelte';
import type { KybaInterface, SubscriptionProps, KybaOptions, HooksCallback } from './types.ts';

const KybaController = (options: KybaOptions): KybaInterface => {
	const { container, enhancers, hooks } = options;

	const tearDowns: Array<() => void> = [];
	const subscriptions: SubscriptionProps = {};

	const nodes = writable<Node[]>([]);
	const edges = writable<Edge[]>([]);
	const panEnabled = writable<boolean>(true);

	let nodeIdCounter = 0;
	let edgeIdCounter = 0;

	const controller: KybaInterface = {
		nodes,
		edges,
		container,
		panEnabled,
		sub: (name: string, callback: HooksCallback) => {
			if (!subscriptions[name]) {
				subscriptions[name] = [];
			}
			if (!subscriptions[name].includes(callback)) {
				subscriptions[name].push(callback);
			}
		},
		dispatch: (name: string) => {
			if (subscriptions[name]) {
				for (const cb of subscriptions[name]) {
					cb(controller);
				}
			}
		},
		addNode: (node: Omit<Node, 'id'>) => {
			const id = `node-${nodeIdCounter++}`;
			nodes.update((n) => [...n, { ...node, id } as Node]);
			return id;
		},
		addEdge: (edge: Omit<Edge, 'id'>) => {
			const id = `edge-${edgeIdCounter++}`;
			edges.update((e) => [...e, { ...edge, id } as Edge]);
			return id;
		},
		getNodeCount: () => {
			let count = 0;
			nodes.subscribe((n) => {
				count = n.length;
			})();
			return count;
		},
		getEdgeCount: () => {
			let count = 0;
			edges.subscribe((e) => {
				count = e.length;
			})();
			return count;
		}
	};

	if (Array.isArray(hooks)) {
		for (const [name, callback] of hooks) {
			controller.sub(name, callback);
		}
	}

	if (enhancers) {
		for (const enhancer of enhancers) {
			tearDowns.push(enhancer(controller));
		}
	}

	return controller;
};

export default KybaController;
