import { writable } from 'svelte/store';

// Metrics are a flat bag of numbers; the module registry defines which keys
// each type has and what they mean.
export type BlockType = string;
export type BlockMetrics = Record<string, number>;

export type BlockSpecs = {
	id: string;
	type: BlockType;
	metrics: BlockMetrics;
};

const block = writable<BlockSpecs | null>(null);

export const selectionStore = {
	subscribe: block.subscribe,
	select: (selected: BlockSpecs) => block.set(selected),
	clear: () => block.set(null),
	updateMetricField: (field: string, value: number) =>
		block.update((current) =>
			current ? { ...current, metrics: { ...current.metrics, [field]: value } } : current
		)
};
