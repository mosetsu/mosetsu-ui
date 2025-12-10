<script lang="ts">
	export let title: string = '';
	export let className: string = '';
	export let activeMenu: string = '';
	export let menus: Array<{ href: string; label: string; iconClass: string }> = [];

	const getLabelClass = (label: string) => {
		return activeMenu === label
			? 'bg-dark-highlight text-text-primary'
			: 'text-text-subtle hover:text-text-secondary';
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
			class={`mb-0.5 flex cursor-pointer items-center rounded-md p-2 text-sm transition-all duration-150 ${getLabelClass(label)}`}
		>
			{#if iconClass}
				<span class={`mr-2.5 scale-95 ${iconClass}`}></span>
			{/if}
			{label}
		</span>
	{/each}
</nav>
