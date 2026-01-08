import { writable } from 'svelte/store';

export type BlockType = 'client' | 'server' | 'db' | 'kafka' | 'rabbitmq' | 's3' | 'load-balancer';

export type ClientMetrics = {
	requestsPerSec: number;
	concurrentConnections: number;
};

export type ServerMetrics = {
	requestsPerSec: number;
	responseTimeMs: number;
	cpuUsage: number;
	memoryUsage: number;
};

export type DatabaseMetrics = {
	queriesPerSec: number;
	readLatencyMs: number;
	writeLatencyMs: number;
	maxConnections: number;
};

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

export type S3Metrics = {
	requestsPerSec: number;
	bandwidthMbps: number;
	storageSizeGb: number;
};

export type LoadBalancerMetrics = {
	requestsPerSec: number;
	activeConnections: number;
	backendServers: number;
};

export type BlockSpecs =
	| { id: string; type: 'client'; metrics: ClientMetrics }
	| { id: string; type: 'server'; metrics: ServerMetrics }
	| { id: string; type: 'db'; metrics: DatabaseMetrics }
	| { id: string; type: 'kafka'; metrics: KafkaMetrics }
	| { id: string; type: 'rabbitmq'; metrics: RabbitMQMetrics }
	| { id: string; type: 's3'; metrics: S3Metrics }
	| { id: string; type: 'load-balancer'; metrics: LoadBalancerMetrics };

export type BlockMetrics =
	| ClientMetrics
	| ServerMetrics
	| DatabaseMetrics
	| KafkaMetrics
	| RabbitMQMetrics
	| S3Metrics
	| LoadBalancerMetrics;

export const DEFAULT_METRICS: Record<BlockType, BlockMetrics> = {
	client: { requestsPerSec: 24, concurrentConnections: 10 },
	server: { requestsPerSec: 100, responseTimeMs: 50, cpuUsage: 30, memoryUsage: 40 },
	db: { queriesPerSec: 200, readLatencyMs: 5, writeLatencyMs: 10, maxConnections: 100 },
	kafka: { messagesPerSec: 1000, partitions: 3, consumerLag: 0 },
	rabbitmq: { messagesPerSec: 500, queueDepth: 0, consumerCount: 2 },
	s3: { requestsPerSec: 50, bandwidthMbps: 100, storageSizeGb: 500 },
	'load-balancer': { requestsPerSec: 500, activeConnections: 50, backendServers: 3 }
};

export const getThroughputMetric = (block: BlockSpecs): number => {
	switch (block.type) {
		case 'client':
			return block.metrics.requestsPerSec;
		case 'server':
			return block.metrics.requestsPerSec;
		case 'db':
			return block.metrics.queriesPerSec;
		case 'kafka':
			return block.metrics.messagesPerSec;
		case 'rabbitmq':
			return block.metrics.messagesPerSec;
		case 's3':
			return block.metrics.requestsPerSec;
		case 'load-balancer':
			return block.metrics.requestsPerSec;
	}
};

const createBlockStore = () => {
	const { subscribe, set, update } = writable<BlockSpecs | null>(null);

	return {
		subscribe,
		select: (block: BlockSpecs) => set(block),
		clear: () => set(null),
		updateMetrics: <T extends BlockMetrics>(metrics: T) => {
			update((current) => {
				if (!current) {
					return current;
				}

				return { ...current, metrics } as BlockSpecs;
			});
		},
		updateMetricField: <K extends string>(field: K, value: number) => {
			update((current) => {
				if (!current) {
					return current;
				}

				return {
					...current,
					metrics: { ...current.metrics, [field]: value }
				} as BlockSpecs;
			});
		}
	};
};

export const blockStore = createBlockStore();
