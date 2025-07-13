import type { Canvas } from 'fabric';

export type Enhancers = Array<(controller: KybaInterface) => () => void>;

export type HooksCallback = (controller: KybaInterface) => void;

export type SubscriptionProps = {
	[name: string]: Array<HooksCallback>;
};

export type KybaInterface = {
	canvas: Canvas;
	sub: (name: string, callback: HooksCallback) => void;
	dispatch: (name: string) => void;
};

export type Hooks = [string, HooksCallback];

export type KybaOptions = {
	canvas: {
		id: string;
		width: number;
		height: number;
	};
	enhancers: Enhancers;
	hooks?: Hooks[];
};
