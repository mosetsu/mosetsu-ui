<script lang="ts">
	import { fly } from 'svelte/transition';
	import toolbarStore, { ToolbarMenu } from '$stores/toolbar';

	let { toolbarVisible } = $props();

	const MENUS = [
		{
			icon: 'ic-pc',
			menu: ToolbarMenu.CLIENT
		},
		// {
		// 	icon: 'ic-connect',
		// 	menu: ToolbarMenu.LINK
		// },
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
		class="border-dark-border bg-dark-elevated absolute bottom-20 flex gap-3 self-center rounded-xl border p-2 shadow-2xl"
		transition:fly={{ y: 64, duration: 360 }}
	>
		{#each MENUS as { icon, menu }}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all duration-150"
				class:active={toolbarMenu === menu}
				onclick={() => handleOnMenuClick(menu)}
				role="button"
				tabindex="0"
				aria-label={menu}
			>
				<span
					class={icon +
						' text-text-secondary h-10 w-10 transition-all duration-150 hover:scale-110'}
				></span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.active {
		background-color: var(--color-dark-border);
		transition: background-color 0.2s ease-in-out;
	}
</style>
