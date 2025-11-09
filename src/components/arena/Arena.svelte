<script lang="ts">
	import Header from '$components/arena/Header.svelte';
	import Footer from '$components/arena/Footer.svelte';
	import Toolbar from '$components/arena/Toolbar.svelte';
	import FlowDraw from '$components/arena/FlowDraw.svelte';

	let toolbarVisible = $state(true);

	const onModuleBtnClick = () => {
		toolbarVisible = !toolbarVisible;
	};
</script>

<section class="relative flex h-full w-full flex-col bg-[#f5f5f5]">
	<Header />
	<div class="flex flex-1">
		<FlowDraw />
	</div>
	<Toolbar {toolbarVisible} />
	<Footer {toolbarVisible} {onModuleBtnClick} />
</section>
