<script lang="ts">
	import { Position, type NodeProps } from '@xyflow/svelte';
	import { selectBlock } from './helper';
	import ConnectedHandle from './ConnectedHandle.svelte';
	import type { DatabaseMetrics } from '$stores/block';

	let { id, data }: NodeProps = $props();
	let metrics = $derived(data?.metrics as DatabaseMetrics);
	const handleClick = () => selectBlock(id, 'db', metrics);
</script>

<div
	{id}
	class="db flex w-60 cursor-pointer flex-col rounded-2xl border border-transparent p-1 shadow-lg transition-all duration-200 hover:scale-[1.02]"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="bg-dark-elevated border-dark-border flex flex-col rounded-xl border p-3">
		<div class="mb-2.5 flex gap-2.5">
			<span class="bg-dark-dots flex items-center rounded-lg px-2 py-1.5">
				<span class="ic-database scale-110"></span>
			</span>
			<div class="flex flex-col justify-center">
				<span class="text-text-primary text-base font-medium">Database</span>
			</div>
		</div>
		<div class="flex flex-wrap gap-1.5">
			<div class="bg-dark-highlight flex items-center gap-1.5 rounded-lg px-2 py-1">
				<img src="/images/request.svg" alt="icon" class="h-3 w-3 opacity-60" />
				<span class="text-text-muted text-sm">{metrics?.queriesPerSec ?? 0} qps</span>
			</div>
			<div class="bg-dark-highlight flex items-center gap-1.5 rounded-lg px-2 py-1">
				<img src="/images/request.svg" alt="icon" class="h-3 w-3 opacity-60" />
				<span class="text-text-muted text-sm">{metrics?.readLatencyMs ?? 0}ms r</span>
			</div>
			<div class="bg-dark-highlight flex items-center gap-1.5 rounded-lg px-2 py-1">
				<img src="/images/request.svg" alt="icon" class="h-3 w-3 opacity-60" />
				<span class="text-text-muted text-sm">{metrics?.writeLatencyMs ?? 0}ms w</span>
			</div>
			<div class="bg-dark-highlight flex items-center gap-1.5 rounded-lg px-2 py-1">
				<img src="/images/request.svg" alt="icon" class="h-3 w-3 opacity-60" />
				<span class="text-text-muted text-sm">{metrics?.maxConnections ?? 0} conn</span>
			</div>
		</div>
	</div>
</div>
<ConnectedHandle nodeId={id} type="target" position={Position.Left} handleId="left" />
<ConnectedHandle nodeId={id} type="source" position={Position.Bottom} handleId="bottom" />

<style>
	:global(.selected > .db) {
		border-color: var(--color-accent-primary);
	}
</style>
