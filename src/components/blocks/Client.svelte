<script lang="ts">
	import { type NodeProps } from '@xyflow/svelte';
	import { selectBlock } from '$components/blocks/helper';

	let { id, data }: NodeProps = $props();

	let metrics = $derived(data?.metrics);
	const handleDbClick = () => selectBlock(id, 'client', 12);
</script>

<div
	{id}
	class="flex w-56 cursor-pointer flex-col rounded-md border border-gray-200 p-2 bg-white"
	ondblclick={handleDbClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleDbClick()}
>
	<div class="mb-2 flex gap-2">
		<span class="flex items-center rounded-md border border-gray-200 p-1">
			<span class="ic-pc scale-85"></span>
		</span>
		<div class="flex flex-col">
			<span class="text-xs font-medium">User Device</span>
			<span class="text-[10px] text-gray-500">Client</span>
		</div>
	</div>
	<div class="ml-auto flex w-fit items-center gap-2 rounded-md border border-gray-200 p-1">
		<img src="/images/request.svg" alt="request-speed-icon" class="h-4 w-4" />
		<span class="text-xs text-gray-500">{metrics}/s</span>
	</div>
</div>
