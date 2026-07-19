<script lang="ts">
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
	import { computeSummary } from '$lib/simulation/summary';
	import { CONGESTION_COLORS } from '$lib/simulation/congestion';

	let summary = $derived(computeSummary(drawState.nodes, drawState.edges));
	let collapsed = $state(true);

	const fmt = (n: number): string => {
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
		if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
		return `${n}`;
	};

	const stats = $derived([
		{ label: 'Modules', value: `${summary.modules}` },
		{ label: 'Links', value: `${summary.links}` },
		{ label: 'Ingress', value: `${fmt(summary.ingressRps)}`, unit: 'rps' },
		{ label: 'Est. latency', value: `${fmt(summary.estLatencyMs)}`, unit: 'ms' },
		{ label: 'Est. cost', value: `$${fmt(summary.costPerMonth)}`, unit: '/mo' }
	]);

	let dotColor = $derived(
		summary.bottleneck
			? CONGESTION_COLORS[summary.bottleneck.status].solid
			: 'var(--color-accent-primary)'
	);
</script>

<aside
	class="glass-elevated border-dark-border-strong/40 flex max-h-full flex-shrink-0 overflow-hidden rounded-2xl border shadow-xl transition-[width] duration-300"
	style:width={collapsed ? '2.25rem' : '15rem'}
>
	<!-- peek / collapse toggle strip (always visible) -->
	<button
		class="border-dark-border/50 hover:bg-dark-highlight/40 flex w-9 flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-3 border-r py-4 transition-colors focus:outline-none"
		onclick={() => (collapsed = !collapsed)}
		title={collapsed ? 'Show system overview' : 'Hide system overview'}
	>
		<span
			class="h-1.5 w-1.5 rounded-full"
			style="background: {dotColor}; box-shadow: 0 0 6px {dotColor};"
		></span>
		<span
			class="text-text-subtle rotate-180 text-[10px] tracking-widest uppercase [writing-mode:vertical-rl]"
			>Overview</span
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
	</button>

	<div class="no-scrollbar w-[calc(15rem-2.25rem)] flex-shrink-0 overflow-y-auto p-3.5">
		<span class="text-text-secondary mb-2.5 block text-xs font-semibold tracking-wide uppercase"
			>System Overview</span
		>

		<div class="grid grid-cols-2 gap-2">
			{#each stats as stat (stat.label)}
				<div class="border-dark-border/60 bg-dark-base/40 rounded-lg border px-2.5 py-1.5">
					<div class="text-text-subtle text-[10px] tracking-wide uppercase">{stat.label}</div>
					<div class="text-text-primary font-mono text-sm font-semibold">
						{stat.value}<span class="text-text-muted ml-0.5 text-[10px] font-normal"
							>{stat.unit ?? ''}</span
						>
					</div>
				</div>
			{/each}
		</div>

		<div class="border-dark-border/60 mt-2.5 flex items-center gap-2 border-t pt-2.5">
			{#if summary.bottleneck}
				<span
					class="h-2 w-2 flex-shrink-0 rounded-full"
					style="background: {dotColor}; box-shadow: 0 0 8px {dotColor};"
				></span>
				<span class="text-text-secondary truncate text-xs">
					{#if summary.bottleneck.status === 'green'}
						Healthy · peak {summary.bottleneck.title} {summary.bottleneck.ratio}%
					{:else}
						Bottleneck: {summary.bottleneck.title} · {summary.bottleneck.ratio}%
					{/if}
				</span>
			{:else}
				<span class="bg-text-faint h-2 w-2 flex-shrink-0 rounded-full"></span>
				<span class="text-text-subtle text-xs">Add modules to analyze flow</span>
			{/if}
		</div>
	</div>
</aside>
