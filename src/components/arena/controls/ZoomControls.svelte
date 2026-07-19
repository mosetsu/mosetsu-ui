<script lang="ts">
	import { zoomControl } from '$components/arena/canvas-state/zoom.svelte';
</script>

<div class="border-dark-border bg-dark-elevated/60 flex items-center gap-1 rounded-lg border p-0.5">
	<button
		class="text-text-secondary hover:bg-dark-highlight hover:text-text-primary cursor-pointer rounded-md px-2.5 py-1 text-sm transition-all focus:outline-none"
		onclick={() => zoomControl.zoomOut()}
		title="Zoom out"
	>
		−
	</button>
	<span class="text-text-subtle min-w-[3rem] text-center font-mono text-xs"
		>{zoomControl.zoomLevel}%</span
	>
	<button
		class="text-text-secondary hover:bg-dark-highlight hover:text-text-primary cursor-pointer rounded-md px-2.5 py-1 text-sm transition-all focus:outline-none"
		onclick={() => zoomControl.zoomIn()}
		title="Zoom in"
	>
		+
	</button>
</div>
