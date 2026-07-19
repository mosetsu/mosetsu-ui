import {
	selectionStore,
	type BlockSpecs,
	type BlockMetrics,
	type BlockType
} from '$stores/selection';

export const selectBlock = (id: string, type: BlockType, metrics: BlockMetrics) => {
	selectionStore.select({ id, type, metrics } as BlockSpecs);
};
