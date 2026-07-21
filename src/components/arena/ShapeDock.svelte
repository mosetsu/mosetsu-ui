<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toolbarStore, type ToolbarSelection } from '$stores/toolbar';
	import { SHAPE_LIST } from '$lib/shapes';

	let { visible }: { visible: boolean } = $props();

	let selected = $derived($toolbarStore);

	const toggleShape = (type: ToolbarSelection) => {
		if (selected === type) {
			toolbarStore.reset();
		} else {
			toolbarStore.select(type);
		}
	};

	// Same drag payload as the module dock, so Canvas handles both trays identically.
	const onDragStart = (event: DragEvent, type: string) => {
		if (!event.dataTransfer) {
			return;
		}
		toolbarStore.reset();
		event.dataTransfer.setData('application/x-module-type', type);
		event.dataTransfer.effectAllowed = 'copy';
	};
</script>

{#if visible}
	<div
		class="glass-elevated border-dark-border-strong/50 absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border p-1.5"
		transition:fly={{ y: 64, duration: 360 }}
	>
		{#each SHAPE_LIST as def (def.type)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="dock-item flex cursor-grab items-center justify-center rounded-xl p-2 transition-all duration-150 active:cursor-grabbing"
				class:active={selected === def.type}
				style="--accent: {def.accent}"
				draggable="true"
				ondragstart={(e) => onDragStart(e, def.type)}
				onclick={() => toggleShape(def.type)}
				role="button"
				tabindex="0"
				aria-label={def.label}
				title={def.label}
			>
				<span class={`shape-glyph shape-glyph-${def.kind}`}></span>
			</div>
		{/each}
	</div>
{/if}

<style>
	.dock-item {
		width: 44px;
		height: 44px;
	}
	.dock-item:hover {
		background-color: var(--color-dark-highlight);
	}
	.dock-item:hover .shape-glyph {
		scale: 1.12;
	}
	.dock-item.active {
		background-color: color-mix(in srgb, var(--accent) 20%, transparent);
		box-shadow:
			inset 0 0 0 1px color-mix(in srgb, var(--accent) 55%, transparent),
			0 0 16px -4px color-mix(in srgb, var(--accent) 70%, transparent);
		transition: all 0.2s ease-in-out;
	}
	.dock-item.active .shape-glyph {
		scale: 1.08;
	}

	/* Mini shape previews, tinted with the shape's accent. */
	.shape-glyph {
		display: block;
		width: 22px;
		height: 22px;
		border: 2px solid var(--accent);
		background: color-mix(in srgb, var(--accent) 20%, transparent);
		transition: scale 0.15s ease;
	}
	.shape-glyph-rectangle {
		border-radius: 4px;
	}
	.shape-glyph-rounded {
		width: 26px;
		height: 16px;
		border-radius: 999px;
	}
	.shape-glyph-diamond {
		width: 18px;
		height: 18px;
		border-radius: 3px;
		transform: rotate(45deg);
	}
	.shape-glyph-ellipse {
		width: 26px;
		height: 17px;
		border-radius: 50%;
	}
	.shape-glyph-circle {
		border-radius: 50%;
	}
	.shape-glyph-parallelogram {
		width: 26px;
		height: 18px;
		border-radius: 3px;
		transform: skewX(-16deg);
	}
</style>
