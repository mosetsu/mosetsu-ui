<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toolbarStore, type ToolbarSelection } from '$stores/toolbar';
	import { dockGroups } from '$lib/modules';

	let { toolbarVisible }: { toolbarVisible: boolean } = $props();

	const groups = dockGroups();
	let selected = $derived($toolbarStore);

	const toggleModule = (type: ToolbarSelection) => {
		if (selected === type) {
			toolbarStore.reset();
		} else {
			toolbarStore.select(type);
		}
	};

	// Native drag-and-drop: carry the module type in the drag payload so the
	// canvas can place it wherever the user drops. Canvas.svelte reads MODULE_DRAG_MIME.
	const onDragStart = (event: DragEvent, type: string) => {
		if (!event.dataTransfer) {
			return;
		}
		// A pending click-to-place selection would conflict with a drop, so clear it.
		toolbarStore.reset();
		event.dataTransfer.setData('application/x-module-type', type);
		event.dataTransfer.effectAllowed = 'copy';
	};
</script>

{#if toolbarVisible}
	<div
		class="glass-elevated border-dark-border-strong/50 absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border p-1.5"
		transition:fly={{ y: 64, duration: 360 }}
	>
		{#each groups as group, gi (group.category)}
			{#if gi > 0}
				<div class="bg-dark-border-strong/40 mx-0.5 h-8 w-px self-center"></div>
			{/if}
			{#each group.modules as def (def.type)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					class="dock-item flex cursor-grab items-center justify-center rounded-xl p-1.5 transition-all duration-150 active:cursor-grabbing"
					class:active={selected === def.type}
					style="--accent: {def.accent}"
					draggable="true"
					ondragstart={(e) => onDragStart(e, def.type)}
					onclick={() => toggleModule(def.type)}
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
