import { blockStore, type BlockSpecs, type BlockMetrics, type BlockType } from '$stores/block';

export const selectBlock = (id: string, type: BlockType, metrics: BlockMetrics) => {
	blockStore.select({ id, type, metrics } as BlockSpecs);
};
