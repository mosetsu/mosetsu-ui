<script lang="ts">
	import { blockStore, type BlockType, type BlockMetrics } from '$stores/block';
	import { drawState } from '$components/arena/helper/draw.svelte.ts';
	import { getInboundConnections, getOutboundConnections } from '$utils/congestion';
	import type { Node } from '@xyflow/svelte';

	let block = $derived($blockStore);

	type ConnectedBlock = {
		id: string;
		type: BlockType;
		metrics: BlockMetrics;
		direction: 'inbound' | 'outbound';
	};

	let connectedBlocks = $derived.by(() => {
		if (!block) {
			return [];
		}

		const edges = drawState.edges;
		const nodes = drawState.nodes;

		const inboundIds = getInboundConnections(block.id, edges);
		const outboundIds = getOutboundConnections(block.id, edges);

		const getBlockFromNode = (node: Node, direction: 'inbound' | 'outbound'): ConnectedBlock => ({
			id: node.id,
			type: node.type as BlockType,
			metrics: node.data?.metrics as BlockMetrics,
			direction
		});

		const inbound = nodes
			.filter((n) => inboundIds.includes(n.id))
			.map((n) => getBlockFromNode(n, 'inbound'));
		const outbound = nodes
			.filter((n) => outboundIds.includes(n.id))
			.map((n) => getBlockFromNode(n, 'outbound'));

		return [...inbound, ...outbound];
	});

	const METRIC_LABELS: Record<BlockType, Record<string, { label: string; unit: string }>> = {
		client: {
			requestsPerSec: { label: 'Requests Rate', unit: 'req/s' },
			concurrentConnections: { label: 'Concurrent Connections', unit: 'conn' }
		},
		server: {
			requestsPerSec: { label: 'Processing Rate', unit: 'req/s' },
			responseTimeMs: { label: 'Response Time', unit: 'ms' },
			cpuUsage: { label: 'CPU Usage', unit: '%' },
			memoryUsage: { label: 'Memory Usage', unit: '%' }
		},
		db: {
			queriesPerSec: { label: 'Query Rate', unit: 'qps' },
			readLatencyMs: { label: 'Read Latency', unit: 'ms' },
			writeLatencyMs: { label: 'Write Latency', unit: 'ms' },
			maxConnections: { label: 'Max Connections', unit: 'conn' }
		},
		kafka: {
			messagesPerSec: { label: 'Message Rate', unit: 'msg/s' },
			partitions: { label: 'Partitions', unit: '' },
			consumerLag: { label: 'Consumer Lag', unit: 'msg' }
		},
		rabbitmq: {
			messagesPerSec: { label: 'Message Rate', unit: 'msg/s' },
			queueDepth: { label: 'Queue Depth', unit: 'msg' },
			consumerCount: { label: 'Consumers', unit: '' }
		},
		s3: {
			requestsPerSec: { label: 'Request Rate', unit: 'req/s' },
			bandwidthMbps: { label: 'Bandwidth', unit: 'Mbps' },
			storageSizeGb: { label: 'Storage Size', unit: 'GB' }
		},
		'load-balancer': {
			requestsPerSec: { label: 'Throughput', unit: 'req/s' },
			activeConnections: { label: 'Active Connections', unit: 'conn' },
			backendServers: { label: 'Backend Servers', unit: '' }
		}
	};

	const BLOCK_TITLES: Record<BlockType, string> = {
		client: 'Client',
		server: 'Server',
		db: 'Database',
		kafka: 'Kafka',
		rabbitmq: 'RabbitMQ',
		s3: 'S3 Storage',
		'load-balancer': 'Load Balancer'
	};

	const BLOCK_ICONS: Record<BlockType, string> = {
		client: 'ic-pc',
		server: 'ic-nodejs',
		db: 'ic-database',
		kafka: 'ic-kafka',
		rabbitmq: 'ic-rabbitmq',
		s3: 'ic-s3',
		'load-balancer': 'ic-load-balancer'
	};

	function handleMetricChange(
		blockId: string,
		blockType: BlockType,
		currentMetrics: BlockMetrics,
		field: string,
		event: Event
	) {
		const target = event.target as HTMLInputElement;
		const newValue = parseInt(target.value) || 0;
		const updatedMetrics = { ...currentMetrics, [field]: newValue };

		drawState.nodes = drawState.nodes.map((node) =>
			node.id === blockId ? { ...node, data: { ...node.data, metrics: updatedMetrics } } : node
		);

		if (block && blockId === block.id) {
			blockStore.updateMetricField(field, newValue);
		}
	}

	function getMetricFields(
		type: BlockType,
		metrics: BlockMetrics
	): Array<{ key: string; value: number; label: string; unit: string }> {
		const labels = METRIC_LABELS[type];
		return Object.entries(metrics).map(([key, value]) => ({
			key,
			value: value as number,
			label: labels[key]?.label ?? key,
			unit: labels[key]?.unit ?? ''
		}));
	}
</script>

<section class="border-dark-border bg-dark-surface flex h-full w-full flex-col border-l">
	<div class="border-dark-border flex h-16 items-center gap-2 border-b p-4">
		<span class="ic-primary-logo text-text-secondary"></span>
		<div class="flex flex-col">
			<span class="text-text-primary mb-0.5 text-base">Tooling</span>
			<span class="text-text-subtle text-sm">Update block metrics</span>
		</div>
	</div>

	<section class="flex flex-col gap-4 overflow-y-auto p-4">
		{#if block}
			<!-- Selected Block -->
			<div class="border-dark-border bg-dark-elevated rounded-lg border p-3">
				<div class="mb-3 flex items-center gap-2">
					<span class={BLOCK_ICONS[block.type] + ' text-text-secondary'}></span>
					<div class="flex flex-col">
						<span class="text-text-primary text-sm font-medium">{BLOCK_TITLES[block.type]}</span>
						<span class="text-text-subtle font-mono text-xs">{block.id}</span>
					</div>
					<span class="bg-accent-primary/20 text-accent-primary ml-auto rounded px-2 py-0.5 text-xs"
						>Selected</span
					>
				</div>
				{#each getMetricFields(block.type, block.metrics) as { key, value, label, unit }}
					<div class="mb-2 flex flex-col gap-1">
						<span class="text-text-subtle font-mono text-xs">{label}</span>
						<label
							class="border-dark-border bg-dark-surface flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
						>
							<input
								type="number"
								class="text-text-primary min-w-0 flex-1 border-none bg-transparent font-mono text-sm outline-none"
								{value}
								oninput={(e) => handleMetricChange(block.id, block.type, block.metrics, key, e)}
								placeholder="0"
								min="0"
							/>
							{#if unit}
								<span
									class="bg-dark-highlight text-text-muted flex-shrink-0 rounded-md px-2 py-1 text-[10px]"
									>{unit}</span
								>
							{/if}
						</label>
					</div>
				{/each}
			</div>

			<!-- Connected Blocks -->
			{#if connectedBlocks.length > 0}
				<div class="text-text-subtle mt-2 flex items-center gap-2 text-xs">
					<div class="bg-dark-border h-px flex-1"></div>
					<span>Connected Blocks</span>
					<div class="bg-dark-border h-px flex-1"></div>
				</div>

				{#each connectedBlocks as connBlock}
					<div class="border-dark-border bg-dark-elevated/50 rounded-lg border p-3">
						<div class="mb-3 flex items-center gap-2">
							<span class={BLOCK_ICONS[connBlock.type] + ' text-text-secondary'}></span>
							<div class="flex flex-col">
								<span class="text-text-primary text-sm font-medium"
									>{BLOCK_TITLES[connBlock.type]}</span
								>
								<span class="text-text-subtle font-mono text-xs">{connBlock.id}</span>
							</div>
							<span
								class="ml-auto rounded px-2 py-0.5 text-xs {connBlock.direction === 'inbound'
									? 'bg-green-500/20 text-green-400'
									: 'bg-blue-500/20 text-blue-400'}"
							>
								{connBlock.direction === 'inbound' ? '← In' : '→ Out'}
							</span>
						</div>
						{#each getMetricFields(connBlock.type, connBlock.metrics) as { key, value, label, unit }}
							<div class="mb-2 flex flex-col gap-1">
								<span class="text-text-subtle font-mono text-xs">{label}</span>
								<label
									class="border-dark-border bg-dark-surface flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
								>
									<input
										type="number"
										class="text-text-primary min-w-0 flex-1 border-none bg-transparent font-mono text-sm outline-none"
										{value}
										oninput={(e) =>
											handleMetricChange(connBlock.id, connBlock.type, connBlock.metrics, key, e)}
										placeholder="0"
										min="0"
									/>
									{#if unit}
										<span
											class="bg-dark-highlight text-text-muted flex-shrink-0 rounded-md px-2 py-1 text-[10px]"
											>{unit}</span
										>
									{/if}
								</label>
							</div>
						{/each}
					</div>
				{/each}
			{/if}
		{:else}
			<div class="bg-dark-elevated h-[64px] animate-pulse rounded-lg"></div>
			<div class="bg-dark-elevated h-[120px] animate-pulse rounded-lg"></div>
			<div class="bg-dark-elevated h-[120px] animate-pulse rounded-lg"></div>
		{/if}
	</section>
</section>
