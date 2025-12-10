<script lang="ts">
	import { blockStore } from '$stores/block';
	import { drawState } from '$components/arena/helper/draw.svelte.ts';

	let block = $derived($blockStore);

	function handleMetricsChange(event: Event) {
		if (!block) {
			return;
		}

		const target = event.target as HTMLInputElement;
		const newValue = parseInt(target.value) || 0;

		drawState.nodes = drawState.nodes.map((node) =>
			node.id === block.id ? { ...node, data: { ...node.data, metrics: newValue } } : node
		);

		blockStore.updateMetrics(newValue);
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

	<section class="flex flex-col gap-4 p-4">
		{#if block}
			<div class="flex flex-col gap-1.5">
				<span class="text-text-subtle font-mono text-xs">ID</span>
				<span class="text-text-primary font-mono text-sm">{block.id}</span>
			</div>

			<div class="flex flex-col gap-1.5">
				<span class="text-text-subtle font-mono text-xs">Type</span>
				<span class="text-text-primary font-mono text-sm capitalize">{block.type}</span>
			</div>

			<div class="flex flex-col gap-1.5">
				<span class="text-text-subtle font-mono text-xs">Processing Rate</span>
				<label
					class="border-dark-border bg-dark-elevated flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all"
				>
					<input
						type="number"
						class="text-text-primary min-w-0 flex-1 border-none bg-transparent font-mono text-sm outline-none"
						value={block.metrics}
						oninput={handleMetricsChange}
						placeholder="0"
						min="0"
					/>
					<span
						class="bg-dark-highlight text-text-muted flex-shrink-0 rounded-md px-2 py-1 text-[10px]"
						>req/s</span
					>
				</label>
			</div>
		{:else}
			<div class="bg-dark-elevated h-[64px] animate-pulse rounded-lg"></div>
			<div class="bg-dark-elevated h-[120px] animate-pulse rounded-lg"></div>
			<div class="bg-dark-elevated h-[120px] animate-pulse rounded-lg"></div>
		{/if}
	</section>
</section>
