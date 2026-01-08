<script lang="ts">
	import MenuBar from '$components/MenuBar.svelte';
</script>

<section class="border-dark-border bg-dark-surface flex h-full w-full flex-col border-r">
	<div class="border-dark-border flex h-16 items-center gap-2 border-b p-4">
		<span class="ic-primary-logo text-text-secondary"></span>
		<h1 class="text-text-primary text-lg">SystemSage</h1>
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
