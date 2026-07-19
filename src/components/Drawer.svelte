<script lang="ts">
	import MenuBar from '$components/MenuBar.svelte';

	let collapsed = $state(true);
</script>

<aside
	class="glass-elevated border-dark-border-strong/40 no-scrollbar absolute top-[72px] bottom-4 left-4 z-30 flex flex-col overflow-y-auto rounded-2xl border p-2 shadow-xl transition-[width] duration-300"
	style:width={collapsed ? '60px' : '224px'}
>
	<button
		class="text-text-muted hover:bg-dark-highlight hover:text-text-primary mb-1 flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus:outline-none"
		class:self-end={!collapsed}
		class:self-center={collapsed}
		onclick={() => (collapsed = !collapsed)}
		title={collapsed ? 'Expand' : 'Collapse'}
		aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
	>
		<svg
			class={'h-4 w-4 transition-transform ' + (collapsed ? '' : 'rotate-180')}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg
		>
	</button>

	<MenuBar
		title="General"
		{collapsed}
		menus={[
			{ href: '/', label: 'Arena', iconClass: 'ic-arena' },
			{ href: '/', label: 'Explore', iconClass: 'ic-dashboard' }
		]}
		activeMenu="Arena"
	/>
	<MenuBar
		title="Your Work"
		{collapsed}
		menus={[
			{ href: '/', label: 'Integrations', iconClass: 'ic-integrations' },
			{ href: '/', label: 'Saved Arenas', iconClass: 'ic-saved-arenas' },
			{ href: '/', label: 'Analytics', iconClass: 'ic-analytics' }
		]}
	/>
	<MenuBar
		title="Dashboard"
		{collapsed}
		menus={[
			{ href: '/', label: 'Members', iconClass: 'ic-members' },
			{ href: '/', label: 'Notifications', iconClass: 'ic-notifications' }
		]}
	/>
	<div class="bg-dark-border/50 mx-1 mt-auto mb-1.5 h-px"></div>
	<MenuBar {collapsed} menus={[{ href: '/', label: 'Settings', iconClass: 'ic-settings' }]} />
</aside>
