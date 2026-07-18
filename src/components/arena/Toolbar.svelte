<script lang="ts">
	import { fly } from 'svelte/transition';
	import toolbarStore from '$stores/toolbar';
	import { dockGroups } from '$lib/modules';

	let { toolbarVisible } = $props();

	const groups = dockGroups();

	const handleOnMenuClick = (type: string) => {
		if (selected === type) {
			toolbarStore.reset();
			return;
		}
		toolbarStore.select(type);
	};

	let selected = $derived($toolbarStore);
</script>

{#if toolbarVisible}
	<div
		class="glass-elevated border-dark-border-strong/50 absolute bottom-28 z-20 flex items-center gap-1 self-center rounded-2xl border p-1.5"
		transition:fly={{ y: 64, duration: 360 }}
	>
		{#each groups as group, gi}
			{#if gi > 0}
				<div class="bg-dark-border-strong/40 mx-0.5 h-8 w-px self-center"></div>
			{/if}
			{#each group.modules as def}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					class="dock-item flex cursor-pointer items-center justify-center rounded-xl p-1.5 transition-all duration-150"
					class:active={selected === def.type}
					style="--accent: {def.accent}"
					onclick={() => handleOnMenuClick(def.type)}
					role="button"
					tabindex="0"
					aria-label={def.title}
					title={def.title}
				>
					<span
						class={def.icon + ' h-9 w-9 transition-all duration-150'}
						style="color: {def.accent}"
					></span>
				</div>
			{/each}
		{/each}
	</div>
{/if}

<style>
	.dock-item:hover {
		background-color: var(--color-dark-highlight);
	}
	.dock-item:hover span {
		scale: 1.12;
	}
	.dock-item.active {
		background-color: color-mix(in srgb, var(--accent) 20%, transparent);
		box-shadow:
			inset 0 0 0 1px color-mix(in srgb, var(--accent) 55%, transparent),
			0 0 16px -4px color-mix(in srgb, var(--accent) 70%, transparent);
		transition: all 0.2s ease-in-out;
	}
	.dock-item.active span {
		scale: 1.08;
	}
</style>
