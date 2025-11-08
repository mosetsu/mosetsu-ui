<script lang="ts">
	import MenuBar from '$components/MenuBar.svelte';
</script>

<section class="flex h-full w-full flex-col border-r border-gray-200 bg-white">
	<div class="flex h-16 items-center gap-2 border-b border-gray-200 p-4">
		<span class="ic-primary-logo"></span>
		<h1 class="text-lg">Mosetsu</h1>
	</div>
	<MenuBar
		title="General"
		menus={[
			{ href: '/', label: 'Arena', iconClass: 'ic-arena' },
			{ href: '/', label: 'Explore', iconClass: 'ic-dashboard' }
		]}
		activeMenu="Arena"
	/>
	<MenuBar
		title="Your Work"
		menus={[
			{ href: '/', label: 'Integrations', iconClass: 'ic-integrations' },
			{ href: '/', label: 'Saved Arenas', iconClass: 'ic-saved-arenas' },
			{ href: '/', label: 'Analytics', iconClass: 'ic-analytics' }
		]}
	/>
	<MenuBar
		title="Dashboard"
		menus={[
			{ href: '/', label: 'Members', iconClass: 'ic-members' },
			{ href: '/', label: 'Notifications', iconClass: 'ic-notifications' }
		]}
	/>
	<MenuBar
		className="mt-auto"
		menus={[
			{ href: '/', label: 'Settings', iconClass: 'ic-settings' }
			// { href: '/', label: 'Help / Support', iconClass: 'ic-help' }
		]}
	/>
</section>

<style>
</style>
