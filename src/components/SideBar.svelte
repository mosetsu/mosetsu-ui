<script lang="ts">
	import { blockStore } from '$stores/block';

	let block = $derived($blockStore);
</script>

<section class="flex h-full w-full flex-col border-l border-gray-200 bg-white">
	<div class="flex h-16 items-center gap-2 border-b border-gray-200 p-4">
		<span class="ic-primary-logo"></span>
		<div class="flex flex-col">
			<span class="mb-1 text-sm">Tooling</span>
			<span class="text-xs text-gray-400"> Update block metrics </span>
		</div>
	</div>

	<section class="flex flex-col gap-4 p-4">
		{#if block}
			<div class="rounded-md border border-gray-200 bg-white p-4">
				<div class="flex flex-col gap-2">
					<div class="flex justify-between">
						<span class="text-xs text-gray-500">ID:</span>
						<span class="font-mono text-xs text-gray-600">{block.id}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-xs text-gray-500">Type:</span>
						<span class="text-xs font-medium capitalize">{block.type}</span>
					</div>
				</div>
			</div>

			<div class="rounded-md border border-gray-200 bg-white p-4">
				<h3 class="mb-3 text-sm font-semibold">Metrics</h3>
				<div class="flex flex-col gap-3">
					<div class="flex items-center justify-between">
						<span class="text-xs text-gray-500">Requests/sec:</span>
						<span class="text-sm font-semibold text-blue-600">
							{block.metrics}
						</span>
					</div>
				</div>
			</div>
		{:else}
			<div class="h-[64px] rounded-sm bg-[#eee]"></div>
			<div class="h-[120px] rounded-sm bg-[#eee]"></div>
			<div class="h-[120px] rounded-sm bg-[#eee]"></div>
		{/if}
	</section>
</section>
