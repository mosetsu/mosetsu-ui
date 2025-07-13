<script lang="ts">
	import NavigationDrawer from '$components/Navigation/Drawer.svelte';
	import Canvas from '$components/Playground/Canvas.svelte';
	import SideBar from '$components/WidgetStatus/SideBar.svelte';
</script>

<section class="grid h-screen w-full grid-cols-[260px_1fr_280px]">
	<NavigationDrawer />
	<Canvas />
	<SideBar />
</section>
