<script lang="ts">
	import { LAYOUT_LIST, getLayout, type LayoutId } from '$lib/design/layouts';
	import { layoutStore } from '$stores/layout';
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
	import { zoomControl } from '$components/arena/canvas-state/zoom.svelte';

	// Each icon applies its layout on click; no persistent active state.
	function apply(id: LayoutId) {
		layoutStore.set(id);
		drawState.applyLayout(getLayout(id));
		zoomControl.fit(120);
	}
</script>

<div
	class="border-dark-border bg-dark-elevated/60 flex items-center gap-0.5 rounded-lg border p-0.5"
>
	{#each LAYOUT_LIST as l (l.id)}
		<button
			class="text-text-secondary hover:bg-dark-highlight hover:text-text-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all focus:outline-none"
			onclick={() => apply(l.id)}
			title={`${l.label} layout`}
			aria-label={`${l.label} layout`}
		>
			<svg
				class="h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d={l.iconPath} />
			</svg>
		</button>
	{/each}
</div>
