<script lang="ts">
	export let title: string = '';
	export let className: string = '';
	export let activeMenu: string = '';
	export let menus: Array<{ href: string; label: string; iconClass: string }> = [];

	const getLabelClass = (label: string) => {
		return activeMenu === label ? 'bg-[#eaeaea] text-black' : 'text-[#8E96A7] hover:text-black';
	};
</script>

<nav class={`flex flex-col p-4 ${className}`}>
	{#if title}
		<span aria-hidden="true" class="mb-2 text-sm text-[#8E96A7]">{title}</span>
	{/if}
	{#each menus as { label, iconClass = '' }}
		<span class={`mb-0.5 flex items-center rounded-sm p-1 text-sm cursor-pointer ${getLabelClass(label)}`}>
			{#if iconClass}
				<span class={`mr-2 scale-95 ${iconClass}`}></span>
			{/if}
			{label}
		</span>
	{/each}
</nav>
