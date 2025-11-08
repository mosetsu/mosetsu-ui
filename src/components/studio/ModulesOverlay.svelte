<script lang="ts">
	import { fly } from 'svelte/transition';
	import moduleMenuStore, { ModuleMenu } from '$stores/moduleMenu';

	export let visible: boolean = false;

	const MENUS = [
		{
			icon: 'ic-pc',
			menu: ModuleMenu.CLIENT
		},
		{
			icon: 'ic-connect',
			menu: ModuleMenu.LINK
		},
		{
			icon: 'ic-nodejs',
			menu: ModuleMenu.SERVER
		},
		{
			icon: 'ic-database',
			menu: ModuleMenu.DB
		}
	];

	$: moduleMenu = $moduleMenuStore;

	const handleOnMenuClick = (menu: ModuleMenu) => {
		if (moduleMenu === menu) {
			moduleMenuStore.reset();
			return;
		}
		moduleMenuStore.select(menu);
	};
</script>

{#if visible}
	<div
		class="absolute bottom-16 flex gap-4 self-center rounded-md bg-gray-800 p-2"
		transition:fly={{ y: 64, duration: 360 }}
	>
		{#each MENUS as { icon, menu }}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="flex cursor-pointer items-center justify-center rounded-md p-1"
				class:active={moduleMenu === menu}
				on:click={() => handleOnMenuClick(menu)}
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
