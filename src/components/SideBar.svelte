<script lang="ts">
	import { blockStore } from '$stores/block';
	import { useSvelteFlow } from '@xyflow/svelte';

	const { updateNodeData } = useSvelteFlow();

	let block = $derived($blockStore);

	function handleMetricsChange(event: Event) {
		if (!block) {
			return;
		}

		const target = event.target as HTMLInputElement;
		const newValue = parseInt(target.value) || 0;

		updateNodeData(block.id, { metrics: newValue });
	}
</script>

<section class="flex h-full w-full flex-col border-l border-gray-200 bg-white">
	<div class="flex h-16 items-center gap-2 border-b border-gray-200 p-4">
		<span class="ic-primary-logo"></span>
		<div class="flex flex-col">
			<span class="mb-1 text-sm">Tooling</span>
			<span class="text-xs text-gray-400">Update block metrics</span>
		</div>
	</div>

	<section class="flex flex-col gap-4 p-4">
		{#if block}
			<div class="flex flex-col gap-1">
				<span class="font-mono text-xs text-gray-500">ID</span>
				<span class="font-mono text-sm text-black">{block.id}</span>
			</div>

			<div class="flex flex-col gap-1">
				<span class="font-mono text-xs text-gray-500">Type</span>
				<span class="font-mono text-sm text-black capitalize">{block.type}</span>
			</div>

			<div class="flex flex-col gap-1">
				<span class="mb-1 font-mono text-xs text-gray-500">Processing Rate</span>
				<label
					class="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm focus-within:border-gray-400"
				>
					<input
						type="number"
						class="min-w-0 flex-1 border-none bg-transparent font-mono text-sm text-black outline-none placeholder:text-gray-400"
						value={block.metrics}
						oninput={handleMetricsChange}
						placeholder="0"
						min="0"
					/>
					<span class="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600"
						>req/s</span
					>
				</label>
			</div>
		{:else}
			<div class="h-[64px] rounded-sm bg-[#eee]"></div>
			<div class="h-[120px] rounded-sm bg-[#eee]"></div>
			<div class="h-[120px] rounded-sm bg-[#eee]"></div>
		{/if}
	</section>
</section>
