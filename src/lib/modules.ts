import { Position } from '@xyflow/svelte';

/**
 * Single source of truth for every module (node type) in the arena.
 * Adding a module = one entry here (+ an `ic-*` icon class in icons.css).
 * The registry drives the dock, node rendering, the inspector, congestion,
 * and the summary HUD.
 */

export type HandleDef = { type: 'source' | 'target'; position: Position; id: string };
export type MetricDef = { key: string; label: string; unit: string };
export type ModuleCategory = 'edge' | 'compute' | 'data' | 'messaging' | 'infra';

export type ModuleDef = {
	type: string;
	title: string;
	subtitle?: string;
	icon: string; // ic-* class from icons.css
	accent: string; // hex — drives card tint / glow
	category: ModuleCategory;
	/** metric key that represents this node's processing capacity (used by congestion) */
	throughputField: string;
	/** rough cost weight ($/month) for the summary HUD */
	costPerMonth: number;
	metrics: MetricDef[];
	handles: HandleDef[];
};

// Handle presets ---------------------------------------------------------
const ORIGIN: HandleDef[] = [
	{ type: 'source', position: Position.Right, id: 'right' },
	{ type: 'source', position: Position.Bottom, id: 'bottom' }
];
// target in (left/top), source out (right/bottom) — flexible for any topology
const FLOW: HandleDef[] = [
	{ type: 'target', position: Position.Left, id: 'left' },
	{ type: 'target', position: Position.Top, id: 'top' },
	{ type: 'source', position: Position.Right, id: 'right' },
	{ type: 'source', position: Position.Bottom, id: 'bottom' }
];

const m = (key: string, label: string, unit: string): MetricDef => ({ key, label, unit });

export const MODULES: Record<string, ModuleDef> = {
	client: {
		type: 'client',
		title: 'User Device',
		subtitle: 'Client',
		icon: 'ic-pc',
		accent: '#4a9eff',
		category: 'edge',
		throughputField: 'requestsPerSec',
		costPerMonth: 0,
		metrics: [
			m('requestsPerSec', 'Requests Rate', 'req/s'),
			m('concurrentConnections', 'Concurrent Connections', 'conn')
		],
		handles: ORIGIN
	},
	dns: {
		type: 'dns',
		title: 'DNS',
		subtitle: 'Resolver',
		icon: 'ic-dns',
		accent: '#94a3b8',
		category: 'infra',
		throughputField: 'queriesPerSec',
		costPerMonth: 20,
		metrics: [m('queriesPerSec', 'Query Rate', 'qps'), m('resolveTimeMs', 'Resolve Time', 'ms')],
		handles: FLOW
	},
	cdn: {
		type: 'cdn',
		title: 'CDN',
		subtitle: 'Edge Cache',
		icon: 'ic-cdn',
		accent: '#38bdf8',
		category: 'edge',
		throughputField: 'requestsPerSec',
		costPerMonth: 150,
		metrics: [
			m('requestsPerSec', 'Request Rate', 'req/s'),
			m('cacheHitRatio', 'Cache Hit Ratio', '%'),
			m('edgeLocations', 'Edge Locations', '')
		],
		handles: FLOW
	},
	firewall: {
		type: 'firewall',
		title: 'Firewall',
		subtitle: 'WAF',
		icon: 'ic-firewall',
		accent: '#f43f5e',
		category: 'infra',
		throughputField: 'requestsPerSec',
		costPerMonth: 80,
		metrics: [
			m('requestsPerSec', 'Inspected Rate', 'req/s'),
			m('blockedPerSec', 'Blocked Rate', 'req/s'),
			m('rulesActive', 'Active Rules', '')
		],
		handles: FLOW
	},
	'load-balancer': {
		type: 'load-balancer',
		title: 'Load Balancer',
		subtitle: 'Distributor',
		icon: 'ic-load-balancer',
		accent: '#33b7c4',
		category: 'edge',
		throughputField: 'requestsPerSec',
		costPerMonth: 60,
		metrics: [
			m('requestsPerSec', 'Throughput', 'req/s'),
			m('activeConnections', 'Active Connections', 'conn'),
			m('backendServers', 'Backend Servers', '')
		],
		handles: FLOW
	},
	'api-gateway': {
		type: 'api-gateway',
		title: 'API Gateway',
		subtitle: 'Gateway',
		icon: 'ic-api-gateway',
		accent: '#f0a93b',
		category: 'edge',
		throughputField: 'requestsPerSec',
		costPerMonth: 120,
		metrics: [
			m('requestsPerSec', 'Throughput', 'req/s'),
			m('rateLimitPerSec', 'Rate Limit', 'req/s'),
			m('routes', 'Routes', '')
		],
		handles: FLOW
	},
	server: {
		type: 'server',
		title: 'Server',
		subtitle: 'NodeJS',
		icon: 'ic-nodejs',
		accent: '#4ac97e',
		category: 'compute',
		throughputField: 'requestsPerSec',
		costPerMonth: 200,
		metrics: [
			m('requestsPerSec', 'Processing Rate', 'req/s'),
			m('responseTimeMs', 'Response Time', 'ms')
		],
		handles: FLOW
	},
	cache: {
		type: 'cache',
		title: 'Cache',
		subtitle: 'Redis',
		icon: 'ic-redis',
		accent: '#e0563b',
		category: 'data',
		throughputField: 'opsPerSec',
		costPerMonth: 100,
		metrics: [
			m('opsPerSec', 'Ops Rate', 'ops/s'),
			m('hitRatio', 'Hit Ratio', '%'),
			m('memoryMb', 'Memory', 'MB')
		],
		handles: FLOW
	},
	db: {
		type: 'db',
		title: 'SQL Database',
		subtitle: 'PostgreSQL',
		icon: 'ic-postgres',
		accent: '#8b7cf6',
		category: 'data',
		throughputField: 'queriesPerSec',
		costPerMonth: 250,
		metrics: [
			m('queriesPerSec', 'Query Rate', 'qps'),
			m('readLatencyMs', 'Read Latency', 'ms'),
			m('writeLatencyMs', 'Write Latency', 'ms'),
			m('replicas', 'Read Replicas', ''),
			m('maxConnections', 'Max Connections', 'conn')
		],
		handles: FLOW
	},
	nosql: {
		type: 'nosql',
		title: 'NoSQL Database',
		subtitle: 'MongoDB',
		icon: 'ic-mongodb',
		accent: '#4faa41',
		category: 'data',
		throughputField: 'opsPerSec',
		costPerMonth: 220,
		metrics: [
			m('opsPerSec', 'Ops Rate', 'ops/s'),
			m('readLatencyMs', 'Read Latency', 'ms'),
			m('shards', 'Shards', ''),
			m('replicas', 'Replicas', '')
		],
		handles: FLOW
	},
	search: {
		type: 'search',
		title: 'Search',
		subtitle: 'Elasticsearch',
		icon: 'ic-elasticsearch',
		accent: '#eab308',
		category: 'data',
		throughputField: 'queriesPerSec',
		costPerMonth: 180,
		metrics: [
			m('queriesPerSec', 'Query Rate', 'qps'),
			m('indexSizeGb', 'Index Size', 'GB'),
			m('shards', 'Shards', '')
		],
		handles: FLOW
	},
	s3: {
		type: 's3',
		title: 'S3 Storage',
		subtitle: 'Object Storage',
		icon: 'ic-s3',
		accent: '#d99a3b',
		category: 'data',
		throughputField: 'requestsPerSec',
		costPerMonth: 90,
		metrics: [
			m('requestsPerSec', 'Request Rate', 'req/s'),
			m('bandwidthMbps', 'Bandwidth', 'Mbps'),
			m('storageSizeGb', 'Storage Size', 'GB')
		],
		handles: FLOW
	},
	kafka: {
		type: 'kafka',
		title: 'Kafka',
		subtitle: 'Event Stream',
		icon: 'ic-kafka',
		accent: '#e0863b',
		category: 'messaging',
		throughputField: 'messagesPerSec',
		costPerMonth: 200,
		metrics: [
			m('messagesPerSec', 'Message Rate', 'msg/s'),
			m('partitions', 'Partitions', ''),
			m('consumerLag', 'Consumer Lag', 'msg')
		],
		handles: FLOW
	},
	rabbitmq: {
		type: 'rabbitmq',
		title: 'RabbitMQ',
		subtitle: 'Message Queue',
		icon: 'ic-rabbitmq',
		accent: '#ff6f3d',
		category: 'messaging',
		throughputField: 'messagesPerSec',
		costPerMonth: 150,
		metrics: [
			m('messagesPerSec', 'Message Rate', 'msg/s'),
			m('queueDepth', 'Queue Depth', 'msg'),
			m('consumerCount', 'Consumers', '')
		],
		handles: FLOW
	},
	monitoring: {
		type: 'monitoring',
		title: 'Monitoring',
		subtitle: 'Observability',
		icon: 'ic-monitoring',
		accent: '#a3e635',
		category: 'infra',
		throughputField: 'metricsPerSec',
		costPerMonth: 70,
		metrics: [m('metricsPerSec', 'Ingest Rate', 'evt/s'), m('retentionDays', 'Retention', 'd')],
		handles: FLOW
	}
};

// Default metric values, derived from each module's metric definitions ----
const SEED: Record<string, Record<string, number>> = {
	client: { requestsPerSec: 24, concurrentConnections: 10 },
	dns: { queriesPerSec: 5000, resolveTimeMs: 15 },
	cdn: { requestsPerSec: 2000, cacheHitRatio: 92, edgeLocations: 12 },
	firewall: { requestsPerSec: 3000, blockedPerSec: 20, rulesActive: 40 },
	'load-balancer': { requestsPerSec: 500, activeConnections: 50, backendServers: 3 },
	'api-gateway': { requestsPerSec: 800, rateLimitPerSec: 1000, routes: 24 },
	server: { requestsPerSec: 100, responseTimeMs: 50 },
	cache: { opsPerSec: 5000, hitRatio: 90, memoryMb: 4096 },
	db: {
		queriesPerSec: 200,
		readLatencyMs: 5,
		writeLatencyMs: 10,
		replicas: 2,
		maxConnections: 100
	},
	nosql: { opsPerSec: 400, readLatencyMs: 8, shards: 3, replicas: 2 },
	search: { queriesPerSec: 300, indexSizeGb: 50, shards: 5 },
	s3: { requestsPerSec: 50, bandwidthMbps: 100, storageSizeGb: 500 },
	kafka: { messagesPerSec: 1000, partitions: 3, consumerLag: 0 },
	rabbitmq: { messagesPerSec: 500, queueDepth: 0, consumerCount: 2 },
	monitoring: { metricsPerSec: 10000, retentionDays: 30 }
};

export const getModule = (type: string): ModuleDef | undefined => MODULES[type];

export const getDefaultMetrics = (type: string): Record<string, number> => ({
	...(SEED[type] ?? {})
});

export const getThroughput = (type: string, metrics: Record<string, number>): number => {
	const def = MODULES[type];
	if (!def) {
		return 0;
	}
	return metrics?.[def.throughputField] ?? 0;
};

/** Ordered list for the toolbar dock, grouped by category. */
export const CATEGORY_ORDER: ModuleCategory[] = ['edge', 'compute', 'data', 'messaging', 'infra'];

export const dockGroups = (): { category: ModuleCategory; modules: ModuleDef[] }[] =>
	CATEGORY_ORDER.map((category) => ({
		category,
		modules: Object.values(MODULES).filter((d) => d.category === category)
	})).filter((g) => g.modules.length > 0);
