<script lang="ts">
	import { selectionStore, type BlockType, type BlockMetrics } from '$stores/selection';
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
	import { getInboundConnections, getOutboundConnections } from '$lib/simulation/congestion';
	import { getModule } from '$lib/modules';
	import { toolingCollapsed, toggleTooling } from '$stores/panels';

	type PlacedBlock = { id: string; type: BlockType; metrics: BlockMetrics };
	type ConnectedBlock = PlacedBlock & { direction: 'inbound' | 'outbound' };

	const blockTitle = (type: BlockType) => getModule(type)?.title ?? type;
	const blockIcon = (type: BlockType) => getModule(type)?.icon ?? 'ic-base-module';
	const blockAccent = (type: BlockType) => getModule(type)?.accent ?? 'var(--color-text-muted)';

	let block = $derived($selectionStore);

	// Open/closed is shared so nodes can open it on double-click; it never
	// auto-opens on plain selection.
	let collapsed = $derived($toolingCollapsed);

	// Searchable list of all placed modules (shown when nothing is selected).
	let paletteSearch = $state('');
	let placedNodes = $derived(
		drawState.nodes.map(
			(n): PlacedBlock => ({
				id: n.id,
				type: n.type as BlockType,
				metrics: (n.data?.metrics ?? {}) as BlockMetrics
			})
		)
	);
	let filteredNodes = $derived.by(() => {
		const q = paletteSearch.trim().toLowerCase();
		if (!q) {
			return placedNodes;
		}
		return placedNodes.filter(
			(n) =>
				blockTitle(n.type).toLowerCase().includes(q) ||
				n.id.toLowerCase().includes(q) ||
				n.type.toLowerCase().includes(q)
		);
	});

	let connectedBlocks = $derived.by((): ConnectedBlock[] => {
		if (!block) {
			return [];
		}
		const byId = new Map(placedNodes.map((n) => [n.id, n]));
		const pick = (ids: string[], direction: ConnectedBlock['direction']) =>
			ids.flatMap((id) => {
				const n = byId.get(id);
				return n ? [{ ...n, direction }] : [];
			});
		return [
			...pick(getInboundConnections(block.id, drawState.edges), 'inbound'),
			...pick(getOutboundConnections(block.id, drawState.edges), 'outbound')
		];
	});

	function updateMetric(blockId: string, metrics: BlockMetrics, field: string, event: Event) {
		const value = parseFloat((event.target as HTMLInputElement).value) || 0;
		const updated = { ...metrics, [field]: value };
		drawState.nodes = drawState.nodes.map((node) =>
			node.id === blockId ? { ...node, data: { ...node.data, metrics: updated } } : node
		);
		if (blockId === block?.id) {
			selectionStore.updateMetricField(field, value);
		}
	}

	function metricFields(type: BlockType, metrics: BlockMetrics) {
		const def = getModule(type);
		if (!def) {
			return Object.entries(metrics).map(([key, value]) => ({ key, value, label: key, unit: '' }));
		}
		return def.metrics.map((m) => ({
			key: m.key,
			value: metrics[m.key] ?? 0,
			label: m.label,
			unit: m.unit
		}));
	}
</script>

{#snippet blockHeader(b: PlacedBlock)}
	<span class={blockIcon(b.type)} style="color: {blockAccent(b.type)}"></span>
	<div class="flex flex-col">
		<span class="text-text-primary text-sm font-medium">{blockTitle(b.type)}</span>
		<span class="text-text-subtle font-mono text-xs">{b.id}</span>
	</div>
{/snippet}

{#snippet metricEditor(b: PlacedBlock)}
	{#each metricFields(b.type, b.metrics) as { key, value, label, unit } (b.id + key)}
		<div class="mb-2 flex flex-col gap-1">
			<span class="text-text-subtle font-mono text-xs">{label}</span>
			<label
				class="border-dark-border bg-dark-surface focus-within:border-accent-primary/60 focus-within:bg-dark-elevated flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
			>
				<input
					type="number"
					class="text-text-primary min-w-0 flex-1 border-none bg-transparent font-mono text-sm outline-none"
					{value}
					oninput={(e) => updateMetric(b.id, b.metrics, key, e)}
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
{/snippet}

<aside
	class="glass-elevated border-dark-border-strong/40 flex min-h-0 flex-1 overflow-hidden rounded-2xl border shadow-xl transition-[width] duration-300"
	style:width={collapsed ? '2.25rem' : '320px'}
>
	<!-- peek / collapse toggle strip (always visible) -->
	<button
		class="border-dark-border/50 hover:bg-dark-highlight/40 flex w-9 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-3 border-r transition-colors focus:outline-none"
		onclick={toggleTooling}
		title={collapsed ? 'Expand tooling' : 'Collapse tooling'}
	>
		<svg
			class={'text-text-muted h-4 w-4 transition-transform ' + (collapsed ? '' : 'rotate-180')}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"><path d="M15 6l-6 6 6 6" /></svg
		>
		<span
			class="text-text-subtle rotate-180 text-[10px] tracking-widest uppercase [writing-mode:vertical-rl]"
			>Tooling</span
		>
	</button>

	<div class="flex w-[calc(320px-2.25rem)] flex-shrink-0 flex-col overflow-hidden">
		<div class="border-dark-border flex h-14 flex-shrink-0 items-center border-b px-4">
			<div class="flex flex-col">
				<span class="text-text-primary text-sm font-semibold tracking-tight">Tooling</span>
				<span class="text-text-subtle text-xs">Update block metrics</span>
			</div>
		</div>

		<section class="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4">
			{#if block}
				<div class="border-dark-border-strong/50 bg-dark-highlight rounded-xl border p-3 shadow-lg">
					<div class="mb-3 flex items-center gap-2">
						{@render blockHeader(block)}
						<span
							class="bg-accent-primary/20 text-accent-primary ml-auto rounded px-2 py-0.5 text-xs"
							>Selected</span
						>
					</div>
					{@render metricEditor(block)}
				</div>

				{#if connectedBlocks.length > 0}
					<div class="text-text-subtle mt-2 flex items-center gap-2 text-xs">
						<div class="bg-dark-border h-px flex-1"></div>
						<span>Connected Blocks</span>
						<div class="bg-dark-border h-px flex-1"></div>
					</div>

					{#each connectedBlocks as connBlock (connBlock.id + connBlock.direction)}
						<div
							class="border-dark-border-strong/40 bg-dark-highlight/70 rounded-xl border p-3 shadow-md"
						>
							<div class="mb-3 flex items-center gap-2">
								{@render blockHeader(connBlock)}
								<span
									class="ml-auto rounded px-2 py-0.5 text-xs {connBlock.direction === 'inbound'
										? 'bg-green-500/20 text-green-400'
										: 'bg-blue-500/20 text-blue-400'}"
								>
									{connBlock.direction === 'inbound' ? '← In' : '→ Out'}
								</span>
							</div>
							{@render metricEditor(connBlock)}
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
						class="text-text-primary placeholder:text-text-faint min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
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
						onclick={() => selectionStore.select(node)}
					>
						<span
							class="node-icon flex items-center rounded-lg px-1.5 py-1"
							style="--accent: {blockAccent(node.type)}"
						>
							<span class={blockIcon(node.type)} style="color: {blockAccent(node.type)}"></span>
						</span>
						<div class="flex min-w-0 flex-col">
							<span class="text-text-primary truncate text-sm font-medium"
								>{blockTitle(node.type)}</span
							>
							<span class="text-text-subtle truncate font-mono text-xs">{node.id}</span>
						</div>
					</button>
				{/each}

				{#if filteredNodes.length === 0}
					<div class="text-text-subtle py-6 text-center text-xs">
						No modules match “{paletteSearch}”
					</div>
				{/if}
			{:else}
				<div class="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
					<span class="ic-base-module text-text-faint scale-150"></span>
					<span class="text-text-secondary text-sm font-medium">No modules yet</span>
					<span class="text-text-subtle text-xs"
						>Add components from the dock below,<br />then select one to tune its metrics.</span
					>
				</div>
			{/if}
		</section>
	</div>
</aside>
