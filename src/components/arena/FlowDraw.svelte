<svelte:options runes />

<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteFlow, Background, BackgroundVariant } from '@xyflow/svelte';
	import { drawState } from '$components/arena/helper/draw.svelte.ts';
	import ToolbarAction from '$components/arena/helper/toolbarAction';
	import ZoomPanel from '$components/arena/ZoomPanel.svelte';

	import '@xyflow/svelte/dist/style.css';

	let container = $state<HTMLDivElement | null>(null);

	onMount(() => {
		let tearDown = () => {};
		if (container) {
			drawState.setContainer(container);
			tearDown = ToolbarAction();
		}

		return () => {
			tearDown();
			drawState.destroy();
		};
	});
</script>

<div bind:this={container} class="arena-container h-full w-full">
	<SvelteFlow
		nodes={drawState.nodes}
		edges={drawState.edges}
		nodeTypes={drawState.nodeTypes}
		edgeTypes={drawState.edgeTypes}
		deleteKey="Delete"
		minZoom={0.1}
		maxZoom={4}
		panOnDrag={drawState.panEnabled}
		selectionOnDrag={false}
		zoomOnScroll={true}
		preventScrolling={false}
		proOptions={{ hideAttribution: true }}
	>
		<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
		<ZoomPanel />
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow) {
		background-color: #f5f5f5;
		cursor: inherit !important;
	}

	:global(.svelte-flow__background) {
		background-color: #f5f5f5;
	}

	:global(.svelte-flow__pane) {
		cursor: inherit !important;
	}

	/* Override SvelteFlow cursors when custom cursor is set */
	:global(.arena-container[style*='crosshair'] .svelte-flow__pane) {
		cursor: crosshair !important;
	}

	:global(.arena-container[style*='crosshair'] .svelte-flow) {
		cursor: crosshair !important;
	}

	/* Default grab cursor when panning is enabled */
	:global(.svelte-flow__pane.draggable) {
		cursor: grab !important;
	}

	:global(.svelte-flow__pane.dragging) {
		cursor: grabbing !important;
	}
</style>
