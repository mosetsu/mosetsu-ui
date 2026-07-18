<script lang="ts">
	export let title: string = '';
	export let className: string = '';
	export let activeMenu: string = '';
	export let menus: Array<{ href: string; label: string; iconClass: string }> = [];

	const getLabelClass = (label: string) => {
		return activeMenu === label
			? 'menu-active text-text-primary'
			: 'text-text-subtle hover:text-text-secondary hover:bg-dark-highlight/50';
	};
</script>

<nav class={`flex flex-col p-4 ${className}`}>
	{#if title}
		<span
			aria-hidden="true"
			class="text-text-faint mb-2 text-xs font-medium tracking-wider uppercase">{title}</span
		>
	{/if}
	{#each menus as { label, iconClass = '' }}
		<span
			class={`relative mb-0.5 flex cursor-pointer items-center rounded-lg p-2 text-sm transition-all duration-150 ${getLabelClass(label)}`}
		>
			{#if iconClass}
				<span class={`mr-2.5 scale-95 ${iconClass}`}></span>
			{/if}
			{label}
		</span>
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
