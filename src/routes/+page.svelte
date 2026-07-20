<script lang="ts">
	import Arena from '$components/arena/Arena.svelte';
	import TitleBar from '$components/arena/TitleBar.svelte';
	import ToolingPanel from '$components/arena/panels/ToolingPanel.svelte';
	import OverviewPanel from '$components/arena/panels/OverviewPanel.svelte';
</script>

<!-- Canvas stage (inset so the background frames it) -->
<Arena />

<!-- Floating title bar (top center, like the footer) -->
<div class="absolute top-3.5 left-1/2 z-30 -translate-x-1/2">
	<TitleBar />
</div>

<!-- Right-edge peek leafs -->
<div class="absolute top-4 right-4 bottom-4 z-30 flex flex-col items-end gap-4">
	<OverviewPanel />
	<ToolingPanel />
</div>
