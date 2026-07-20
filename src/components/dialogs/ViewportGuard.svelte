<script lang="ts">
	import { browser } from '$app/environment';

	const MIN_WIDTH = 1000;

	let width = $state(browser ? window.innerWidth : MIN_WIDTH);
	let dismissed = $state(false);

	let show = $derived(width < MIN_WIDTH && !dismissed);
</script>

<svelte:window bind:innerWidth={width} />

{#if show}
	<div
		class="bg-dark-base/90 fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md"
	>
		<div
			class="glass-elevated border-dark-border-strong/40 flex max-w-sm flex-col items-center rounded-2xl border p-8 text-center shadow-2xl"
		>
			<span
				class="border-accent-primary/30 bg-accent-primary/10 text-accent-primary glow-soft mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border"
			>
				<svg
					class="h-7 w-7"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="2" y="3" width="20" height="14" rx="2" />
					<path d="M8 21h8M12 17v4" />
				</svg>
			</span>

			<h2 class="text-text-primary mb-2 text-lg font-semibold tracking-tight">
				Best on a bigger screen
			</h2>
			<p class="text-text-secondary mb-1 text-sm">
				SystemSage is a spatial canvas built for desktops and wide viewports.
			</p>
			<p class="text-text-subtle mb-6 text-xs">
				Your window is {width}px wide, panels may overlap or feel cramped. For the best experience,
				open it on a larger screen.
			</p>

			<button
				class="bg-accent-primary hover:bg-accent-hover glow-accent cursor-pointer rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all focus:outline-none"
				onclick={() => (dismissed = true)}
			>
				Continue anyway
			</button>
		</div>
	</div>
{/if}
