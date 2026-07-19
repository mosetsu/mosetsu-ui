<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { portal } from '$actions/portal';
	import type { Snippet } from 'svelte';

	let {
		open = false,
		onclose = () => {},
		class: cls = 'max-w-sm',
		children
	}: {
		open?: boolean;
		onclose?: () => void;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

{#if open}
	<!-- Portaled to <body> so `fixed` is relative to the viewport, not a
	     transformed ancestor (e.g. the glass footer). -->
	<div
		use:portal
		class="bg-dark-base/70 fixed inset-0 z-[80] flex items-center justify-center p-6 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
		role="button"
		tabindex="-1"
		aria-label="Close dialog"
		onclick={(e) => e.target === e.currentTarget && onclose()}
		onkeydown={(e) => e.key === 'Escape' && onclose()}
	>
		<div
			class={`glass-elevated border-dark-border-strong/40 w-full rounded-2xl border p-6 shadow-2xl ${cls}`}
			transition:fly={{ y: 10, duration: 180 }}
			role="dialog"
			aria-modal="true"
		>
			{@render children?.()}
		</div>
	</div>
{/if}
