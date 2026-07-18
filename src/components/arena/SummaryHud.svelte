<script lang="ts">
	import { drawState } from '$components/arena/helper/draw.svelte.ts';
	import { computeSummary } from '$utils/summary';
	import { CONGESTION_COLORS } from '$utils/congestion';

	let summary = $derived(computeSummary(drawState.nodes, drawState.edges));
	let collapsed = $state(false);

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
</script>

{#if summary.modules > 0}
	<div
		class="glass-elevated border-dark-border-strong/50 absolute top-4 left-4 z-20 w-56 rounded-2xl border p-3"
	>
		<button
			class="flex w-full cursor-pointer items-center gap-2 focus:outline-none"
			onclick={() => (collapsed = !collapsed)}
			aria-expanded={!collapsed}
			title={collapsed ? 'Expand' : 'Collapse'}
		>
			<span
				class="h-1.5 w-1.5 flex-shrink-0 rounded-full"
				style={summary.bottleneck
					? `background: ${CONGESTION_COLORS[summary.bottleneck.status].solid};`
					: 'background: var(--color-accent-primary);'}
			></span>
			<span class="text-text-secondary text-xs font-semibold tracking-wide uppercase">
				System Overview
			</span>
			{#if collapsed}
				<span class="text-text-subtle ml-auto font-mono text-[11px]"
					>{summary.modules}·{summary.links}</span
				>
			{/if}
			<svg
				class={'text-text-muted h-3.5 w-3.5 transition-transform duration-200 ' +
					(collapsed ? 'ml-1 -rotate-90' : 'ml-auto')}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M6 9l6 6 6-6" />
			</svg>
		</button>

		{#if !collapsed}
			<div class="mt-2.5 grid grid-cols-2 gap-2">
				{#each stats as stat}
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
						style="background: {CONGESTION_COLORS[summary.bottleneck.status]
							.solid}; box-shadow: 0 0 8px {CONGESTION_COLORS[summary.bottleneck.status].solid};"
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
					<span class="text-text-subtle text-xs">Connect modules to analyze flow</span>
				{/if}
			</div>
		{/if}
	</div>
{/if}
