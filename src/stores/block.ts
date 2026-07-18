import { writable } from 'svelte/store';
import { getDefaultMetrics, getThroughput } from '$lib/modules';

// Metrics are a flat bag of numbers; the module registry defines which keys
// each type has and what they mean.
export type BlockType = string;
export type BlockMetrics = Record<string, number>;

export type BlockSpecs = {
	id: string;
	type: BlockType;
	metrics: BlockMetrics;
};

// Kept for the bespoke Kafka / RabbitMQ components which read typed metrics.
export type KafkaMetrics = {
	messagesPerSec: number;
	partitions: number;
	consumerLag: number;
};

export type RabbitMQMetrics = {
	messagesPerSec: number;
	queueDepth: number;
	consumerCount: number;
};

/** Default metrics for a freshly-dropped node of the given type. */
export const getBlockDefaults = (type: BlockType): BlockMetrics => getDefaultMetrics(type);

/** The metric that represents a block's processing capacity. */
export const getThroughputMetric = (block: BlockSpecs): number =>
	getThroughput(block.type, block.metrics);

const createBlockStore = () => {
	const { subscribe, set, update } = writable<BlockSpecs | null>(null);

	return {
		subscribe,
		select: (block: BlockSpecs) => set(block),
		clear: () => set(null),
		updateMetrics: (metrics: BlockMetrics) => {
			update((current) => {
				if (!current) {
					return current;
				}

				return { ...current, metrics };
			});
		},
		updateMetricField: (field: string, value: number) => {
			update((current) => {
				if (!current) {
					return current;
				}

				return {
					...current,
					metrics: { ...current.metrics, [field]: value }
				};
			});
		}
	};
};

export const blockStore = createBlockStore();
