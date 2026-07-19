<script lang="ts">
	import { type NodeProps } from '@xyflow/svelte';
	import { selectBlock } from './helper';
	import ConnectedHandle from './ConnectedHandle.svelte';
	import { getModule } from '$lib/modules';
	import { openTooling } from '$stores/panels';
	import type { BlockMetrics, BlockType } from '$stores/block';

	let { id, type, data }: NodeProps = $props();

	let def = $derived(getModule(type as string));
	let metrics = $derived((data?.metrics ?? {}) as BlockMetrics);

	const handleClick = () => {
		if (def) selectBlock(id, type as BlockType, metrics);
	};

	// Double-click a module opens the tooling panel (if closed) to edit metrics.
	const handleDblClick = () => {
		if (!def) return;
		selectBlock(id, type as BlockType, metrics);
		openTooling();
	};

	const fmt = (value: number, unit: string): string => {
		if (!unit) return `${value}`;
		return /^[a-zA-Z]/.test(unit) ? `${value} ${unit}` : `${value}${unit}`;
	};
</script>

{#if def}
	<div
		{id}
		class={`${type} flex w-60 cursor-pointer flex-col rounded-2xl border border-transparent p-1 shadow-lg transition-all duration-200 hover:scale-[1.02]`}
		style="--accent: {def.accent}"
		onclick={handleClick}
		ondblclick={handleDblClick}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && handleClick()}
	>
		<div class="node-card flex flex-col rounded-xl p-3">
			<div class="mb-2.5 flex gap-2.5">
				<span class="node-icon flex items-center rounded-lg px-2 py-1.5">
					<span class={def.icon + ' scale-110'} style="color: {def.accent}"></span>
				</span>
				<div class="flex flex-col justify-center">
					<span class="text-text-primary text-base font-medium">{def.title}</span>
					{#if def.subtitle}
						<span class="text-text-subtle text-sm">{def.subtitle}</span>
					{/if}
				</div>
			</div>
			<div class="flex flex-wrap gap-1.5">
				{#each def.metrics as metric (metric.key)}
					<div class="node-pill flex items-center gap-1.5 rounded-lg px-2 py-1">
						<img src="/images/request.svg" alt="" class="h-3 w-3 opacity-60" />
						<span class="text-text-muted text-sm"
							>{fmt(metrics?.[metric.key] ?? 0, metric.unit)}</span
						>
					</div>
				{/each}
			</div>
		</div>
	</div>

	{#each def.handles as handle (handle.id)}
		<ConnectedHandle
			nodeId={id}
			type={handle.type}
			position={handle.position}
			handleId={handle.id}
		/>
	{/each}
{/if}
