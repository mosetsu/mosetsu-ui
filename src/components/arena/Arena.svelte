<script lang="ts">
	import Footer from '$components/arena/ActionBar.svelte';
	import Toolbar from '$components/arena/ModuleDock.svelte';
	import FlowDraw from '$components/arena/Canvas.svelte';
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
		<FlowDraw />
	</div>
	<div class="ambient-bloom"></div>
	<Toolbar {toolbarVisible} />
	<Footer {toolbarVisible} {onModuleBtnClick} />
	<DesignSync />
</section>
