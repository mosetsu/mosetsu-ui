<script lang="ts">
	import NavigationDrawer from '$components/Drawer.svelte';
	import Canvas from '$components/studio/Canvas.svelte';
	import SideBar from '$components/SideBar.svelte';
</script>

<section class="grid h-screen w-full grid-cols-[260px_1fr_280px]">
	<NavigationDrawer />
	<Canvas />
	<SideBar />
</section>
