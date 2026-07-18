<script lang="ts">
	import Header from '$components/arena/Header.svelte';
	import Footer from '$components/arena/Footer.svelte';
	import Toolbar from '$components/arena/Toolbar.svelte';
	import FlowDraw from '$components/arena/FlowDraw.svelte';
	import SummaryHud from '$components/arena/SummaryHud.svelte';

	let toolbarVisible = $state(true);

	const onModuleBtnClick = () => {
		toolbarVisible = !toolbarVisible;
	};
</script>

<section class="bg-dark-base relative flex h-full w-full flex-col overflow-hidden">
	<Header />
	<div class="relative flex flex-1">
		<FlowDraw />
		<SummaryHud />
	</div>
	<div class="ambient-bloom"></div>
	<Toolbar {toolbarVisible} />
	<Footer {toolbarVisible} {onModuleBtnClick} />
</section>
