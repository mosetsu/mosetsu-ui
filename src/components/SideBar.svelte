<script lang="ts">
	import { blockStore, type BlockType, type BlockMetrics } from '$stores/block';
	import { drawState } from '$components/arena/helper/draw.svelte.ts';
	import { getInboundConnections, getOutboundConnections } from '$utils/congestion';
	import { getModule } from '$lib/modules';
	import type { Node } from '@xyflow/svelte';

	const blockTitle = (type: BlockType) => getModule(type)?.title ?? type;
	const blockIcon = (type: BlockType) => getModule(type)?.icon ?? 'ic-base-module';
	const blockAccent = (type: BlockType) => getModule(type)?.accent ?? 'var(--color-text-muted)';

	let block = $derived($blockStore);

	// Searchable list of all placed modules (shown when nothing is selected).
	let paletteSearch = $state('');
	let placedNodes = $derived(
		drawState.nodes.map((n) => ({
			id: n.id,
			type: n.type as BlockType,
			metrics: (n.data?.metrics ?? {}) as BlockMetrics
		}))
	);
	let filteredNodes = $derived.by(() => {
		const q = paletteSearch.trim().toLowerCase();
		if (!q) return placedNodes;
		return placedNodes.filter(
			(n) =>
				blockTitle(n.type).toLowerCase().includes(q) ||
				n.id.toLowerCase().includes(q) ||
				n.type.toLowerCase().includes(q)
		);
	});
	const selectPlacedNode = (n: { id: string; type: BlockType; metrics: BlockMetrics }) => {
		blockStore.select({ id: n.id, type: n.type, metrics: n.metrics });
	};

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
		const def = getModule(type);
		if (!def) {
			return Object.entries(metrics).map(([key, value]) => ({
				key,
				value: value as number,
				label: key,
				unit: ''
			}));
		}
		return def.metrics.map((metric) => ({
			key: metric.key,
			value: metrics[metric.key] ?? 0,
			label: metric.label,
			unit: metric.unit
		}));
	}
</script>

<section class="border-dark-border bg-dark-surface flex h-full min-h-0 w-full flex-col overflow-hidden border-l">
	<div class="border-dark-border flex h-16 flex-shrink-0 items-center gap-2.5 border-b p-4">
		<span class="ic-primary-logo text-accent-primary"></span>
		<div class="flex flex-col">
			<span class="text-text-primary mb-0.5 text-base font-semibold tracking-tight">Tooling</span>
			<span class="text-text-subtle text-xs">Update block metrics</span>
		</div>
	</div>

	<section class="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
		{#if block}
			<!-- Selected Block -->
			<div class="border-dark-border-strong/50 bg-dark-highlight rounded-xl border p-3 shadow-lg">
				<div class="mb-3 flex items-center gap-2">
					<span class={blockIcon(block.type)} style="color: {getModule(block.type)?.accent}"></span>
					<div class="flex flex-col">
						<span class="text-text-primary text-sm font-medium">{blockTitle(block.type)}</span>
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
							class="border-dark-border bg-dark-surface focus-within:border-accent-primary/60 focus-within:bg-dark-elevated flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
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
					<div class="border-dark-border-strong/40 bg-dark-highlight/70 rounded-xl border p-3 shadow-md">
						<div class="mb-3 flex items-center gap-2">
							<span
								class={blockIcon(connBlock.type)}
								style="color: {getModule(connBlock.type)?.accent}"
							></span>
							<div class="flex flex-col">
								<span class="text-text-primary text-sm font-medium">{blockTitle(connBlock.type)}</span>
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
									class="border-dark-border bg-dark-surface focus-within:border-accent-primary/60 focus-within:bg-dark-elevated flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
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
		{:else if placedNodes.length > 0}
			<!-- Module list (nothing selected) -->
			<label
				class="border-dark-border bg-dark-surface focus-within:border-accent-primary/60 flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
			>
				<span class="text-text-subtle text-sm">⌕</span>
				<input
					type="text"
					class="text-text-primary min-w-0 flex-1 border-none bg-transparent text-sm outline-none placeholder:text-text-faint"
					placeholder="Search modules…"
					bind:value={paletteSearch}
				/>
				<span class="text-text-faint flex-shrink-0 font-mono text-[10px]"
					>{filteredNodes.length}/{placedNodes.length}</span
				>
			</label>

			{#each filteredNodes as node (node.id)}
				<button
					class="border-dark-border-strong/40 bg-dark-highlight/70 hover:border-dark-border-strong hover:bg-dark-highlight flex w-full cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all focus:outline-none"
					onclick={() => selectPlacedNode(node)}
				>
					<span class="node-icon flex items-center rounded-lg px-1.5 py-1" style="--accent: {blockAccent(node.type)}">
						<span class={blockIcon(node.type)} style="color: {blockAccent(node.type)}"></span>
					</span>
					<div class="flex min-w-0 flex-col">
						<span class="text-text-primary truncate text-sm font-medium">{blockTitle(node.type)}</span>
						<span class="text-text-subtle truncate font-mono text-xs">{node.id}</span>
					</div>
				</button>
			{/each}

			{#if filteredNodes.length === 0}
				<div class="text-text-subtle py-6 text-center text-xs">No modules match “{paletteSearch}”</div>
			{/if}
		{:else}
			<div class="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
				<span class="ic-base-module text-text-faint scale-150"></span>
				<span class="text-text-secondary text-sm font-medium">No modules yet</span>
				<span class="text-text-subtle text-xs">Add components from the dock below,<br />then select one to tune its metrics.</span>
			</div>
		{/if}
	</section>
</section>
