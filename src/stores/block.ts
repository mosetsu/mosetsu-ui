import { writable } from 'svelte/store';

export type BlockSpecs = {
	id: string;
	type: string;
	metrics: number;
};

const createBlockStore = () => {
	const { subscribe, set, update } = writable<BlockSpecs | null>(null);

	return {
		subscribe,
		select: (block: BlockSpecs) => set(block),
		clear: () => set(null),
		updateMetrics: (metrics: BlockSpecs['metrics']) => {
			update((current) => {
				if (!current) {
					return current;
				}

				return { ...current, metrics };
			});
		}
	};
};

export const blockStore = createBlockStore();
