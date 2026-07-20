<script lang="ts">
	type MenuItem = { href: string; label: string; iconClass: string };

	let {
		title = '',
		activeMenu = '',
		collapsed = false,
		menus = []
	}: {
		title?: string;
		activeMenu?: string;
		collapsed?: boolean;
		menus?: MenuItem[];
	} = $props();
</script>

<nav class="flex flex-col px-1 py-1">
	{#if title && !collapsed}
		<span
			aria-hidden="true"
			class="text-text-faint mt-1 mb-1 px-2 text-[10px] font-medium tracking-wider uppercase"
			>{title}</span
		>
	{/if}
	{#each menus as { label, href, iconClass } (label)}
		<a
			{href}
			class={`relative mb-0.5 flex cursor-pointer items-center rounded-lg p-2 text-sm no-underline transition-all duration-150 ${collapsed ? 'justify-center' : ''} ${
				activeMenu === label
					? 'menu-active text-text-primary'
					: 'text-text-subtle hover:text-text-secondary hover:bg-dark-highlight/50'
			}`}
			title={collapsed ? label : ''}
		>
			{#if iconClass}
				<span class={`scale-95 ${collapsed ? '' : 'mr-2.5'} ${iconClass}`}></span>
			{/if}
			{#if !collapsed}{label}{/if}
		</a>
	{/each}
</nav>

<style>
	:global(.menu-active) {
		background: color-mix(in srgb, var(--color-accent-primary) 12%, transparent);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent-primary) 22%, transparent);
	}
	:global(.menu-active)::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		height: 60%;
		width: 3px;
		border-radius: 0 3px 3px 0;
		transform: translateY(-50%);
		background: var(--color-accent-primary);
		box-shadow: 0 0 10px 0 var(--color-accent-glow);
	}
</style>
