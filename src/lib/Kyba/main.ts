import { Canvas } from 'fabric';
import type { KybaInterface, SubscriptionProps, KybaOptions, HooksCallback } from './types.ts';

const KybaController = (options: KybaOptions): KybaInterface => {
	const { canvas, enhancers, hooks } = options;

	const tearDowns: Array<() => void> = [];
	const subscriptions: SubscriptionProps = {};

	const controller: KybaInterface = {
		canvas: new Canvas(canvas.id, {
			width: canvas.width,
			height: canvas.height,
			preserveObjectStacking: true
		}),
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
