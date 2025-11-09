<script lang="ts">
	import SideBar from '$components/SideBar.svelte';
	import Arena from '$components/arena/Arena.svelte';
	import NavigationDrawer from '$components/Drawer.svelte';
</script>

<section class="grid h-screen w-full grid-cols-[260px_1fr_280px]">
	<NavigationDrawer />
	<Arena />
	<SideBar />
</section>
