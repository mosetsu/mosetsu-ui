<script lang="ts">
	import ActionBar from '$components/arena/ActionBar.svelte';
	import ModuleDock from '$components/arena/ModuleDock.svelte';
	import Canvas from '$components/arena/Canvas.svelte';
	import DesignSync from '$components/arena/DesignSync.svelte';

	let toolbarVisible = $state(true);

	const onModuleBtnClick = () => {
		toolbarVisible = !toolbarVisible;
	};
</script>

<section
	class="border-dark-border/50 bg-dark-base absolute inset-2 overflow-hidden rounded-[26px] border"
>
	<!-- Canvas fills the whole stage; everything else floats over it -->
	<div class="absolute inset-0">
		<Canvas />
	</div>
	<div class="ambient-bloom"></div>
	<ModuleDock {toolbarVisible} />
	<ActionBar {toolbarVisible} {onModuleBtnClick} />
	<DesignSync />
</section>
