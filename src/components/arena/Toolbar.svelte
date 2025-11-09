<script lang="ts">
	import { fly } from 'svelte/transition';
	import toolbarStore, { ToolbarMenu } from '$stores/toolbar';

	let { toolbarVisible } = $props();

	const MENUS = [
		{
			icon: 'ic-pc',
			menu: ToolbarMenu.CLIENT
		},
		{
			icon: 'ic-connect',
			menu: ToolbarMenu.LINK
		},
		{
			icon: 'ic-nodejs',
			menu: ToolbarMenu.SERVER
		},
		{
			icon: 'ic-database',
			menu: ToolbarMenu.DB
		}
	];

	const handleOnMenuClick = (menu: ToolbarMenu) => {
		if (toolbarMenu === menu) {
			toolbarStore.reset();
			return;
		}
		toolbarStore.select(menu);
	};

	let toolbarMenu = $derived($toolbarStore);
</script>

{#if toolbarVisible}
	<div
		class="absolute bottom-16 flex gap-4 self-center rounded-md bg-gray-800 p-2"
		transition:fly={{ y: 64, duration: 360 }}
	>
		{#each MENUS as { icon, menu }}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="flex cursor-pointer items-center justify-center rounded-md p-1"
				class:active={toolbarMenu === menu}
				onclick={() => handleOnMenuClick(menu)}
				role="button"
				tabindex="0"
				aria-label={menu}
			>
				<span class={icon + ' h-12 w-12 text-white transition-all duration-150 hover:scale-110'}
				></span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.active {
		background-color: var(--color-gray-600);
		transition: background-color 0.3s ease-in-out;
	}
</style>
