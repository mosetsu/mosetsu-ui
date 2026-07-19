<script lang="ts">
	import Footer from '$components/arena/Footer.svelte';
	import Toolbar from '$components/arena/Toolbar.svelte';
	import FlowDraw from '$components/arena/FlowDraw.svelte';

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
</section>
