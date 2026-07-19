<script lang="ts">
	import { fly } from 'svelte/transition';

	let { message = '', class: cls = '' }: { message?: string; class?: string } = $props();
</script>

{#if message}
	<div
		class={`glass-elevated border-accent-primary/30 text-text-primary rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap shadow-xl ${cls}`}
		transition:fly={{ y: 8, duration: 160 }}
	>
		{message}
	</div>
{/if}
