<script lang="ts">
	import { blockStore } from '$stores/block';

	let block = $derived($blockStore);
</script>

<section class="flex h-full w-full flex-col border-l border-gray-200 bg-white">
	<div class="flex h-16 items-center gap-2 border-b border-gray-200 p-4">
		<span class="ic-primary-logo"></span>
		<div class="flex flex-col">
			<span class="mb-1 text-sm">Tooling</span>
			<span class="text-xs text-gray-400">Update block metrics</span>
		</div>
	</div>

	<section class="flex flex-col p-4 font-mono">
		{#if block}
			<span class="text-xs text-gray-500 mb-1">ID</span>
			<span class="text-sm text-black mb-4">{block.id}</span>
			<span class="text-xs text-gray-500 mb-1">Type</span>
			<span class="text-sm text-black mb-4">{block.type}</span>
			<span class="text-xs text-gray-500 mb-1">Processing Rate</span>
			<span class="text-sm text-black mb-4">{block.metrics}</span>
		{:else}
			<div class="h-[64px] rounded-sm bg-[#eee]"></div>
			<div class="h-[120px] rounded-sm bg-[#eee]"></div>
			<div class="h-[120px] rounded-sm bg-[#eee]"></div>
		{/if}
	</section>
</section>
