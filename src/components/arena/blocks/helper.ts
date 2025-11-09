import { blockStore } from '$stores/block';

export const selectBlock = (id: string, type: string, metrics: number) => {
	blockStore.select({
		id,
		type,
		metrics
	});
};
