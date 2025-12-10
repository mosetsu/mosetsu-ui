<script lang="ts">
	import { Position, type NodeProps } from '@xyflow/svelte';
	import { selectBlock } from './helper';
	import ConnectedHandle from './ConnectedHandle.svelte';

	let { id, data }: NodeProps = $props();
	let metrics = $derived(data?.metrics as number);
	const handleDbClick = () => selectBlock(id, 'db', metrics);
</script>

<div
	{id}
	class="border-dark-border bg-dark-elevated flex w-36 cursor-pointer flex-col rounded-xl border p-3 shadow-lg transition-all duration-200 hover:scale-[1.02]"
	ondblclick={handleDbClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleDbClick()}
>
	<div class="mb-2.5 flex gap-2.5">
		<span class="bg-dark-highlight flex items-center rounded-lg p-1.5">
			<span class="ic-database text-text-secondary scale-90"></span>
		</span>
		<div class="flex flex-col justify-center">
			<span class="text-text-primary text-xs font-medium">Database</span>
		</div>
	</div>
	<div class="bg-dark-highlight ml-auto flex w-fit items-center gap-2 rounded-lg px-2 py-1">
		<img src="/images/request.svg" alt="request-speed-icon" class="h-3.5 w-3.5 opacity-60" />
		<span class="text-text-muted text-xs font-medium">{metrics}/s</span>
	</div>
</div>
<ConnectedHandle nodeId={id} type="target" position={Position.Left} handleId="left" />
<ConnectedHandle nodeId={id} type="target" position={Position.Bottom} handleId="bottom" />
