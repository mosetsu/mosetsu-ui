<script lang="ts">
	import SideBar from '$components/SideBar.svelte';
	import Arena from '$components/arena/Arena.svelte';
	import Drawer from '$components/Drawer.svelte';
	import Header from '$components/arena/Header.svelte';
	import SummaryHud from '$components/arena/SummaryHud.svelte';
</script>

<section class="relative h-screen w-full overflow-hidden">
	<!-- Canvas stage (inset so the background frames it) -->
	<Arena />

	<!-- Brand: independent, always present in the top-left corner -->
	<div class="absolute top-4 left-5 z-40 flex items-center gap-2.5">
		<span class="ic-primary-logo text-accent-primary glow-soft"></span>
		<h1 class="text-text-primary text-lg font-semibold tracking-tight">
			System<span class="text-accent-primary">Sage</span>
		</h1>
	</div>

	<!-- Floating title bar (top center, like the footer) -->
	<div class="absolute top-3.5 left-1/2 z-30 -translate-x-1/2">
		<Header />
	</div>

	<!-- Floating side panels + peek leafs -->
	<Drawer />
	<div class="absolute top-4 right-4 bottom-4 z-30 flex flex-col items-end gap-4">
		<SummaryHud />
		<SideBar />
	</div>
</section>
