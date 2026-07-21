<svelte:options runes />

<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteFlow, Background, BackgroundVariant } from '@xyflow/svelte';
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
	import { bindToolbarPlacement } from '$components/arena/canvas-state/toolbarPlacement';
	import ZoomPanel from '$components/arena/ZoomPanel.svelte';
	import { zoomControl, MIN_ZOOM, MAX_ZOOM } from '$components/arena/canvas-state/zoom.svelte';

	let container = $state<HTMLDivElement | null>(null);

	// One discrete zoom step per wheel notch (mouse) / accumulated delta (trackpad),
	// matching the +/- buttons exactly.
	const WHEEL_THRESHOLD = 50;
	let wheelAccum = 0;

	// Native drag-and-drop from ModuleDock: allow the drop, then place the node
	// at the exact flow position under the cursor (reusing the addNode factory).
	const onDragOver = (event: DragEvent) => {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'copy';
		}
	};

	const onDrop = (event: DragEvent) => {
		const type = event.dataTransfer?.getData('application/x-module-type');
		if (!type) {
			return;
		}
		event.preventDefault();
		const el = container;
		if (!el) {
			return;
		}
		const point = { x: event.clientX, y: event.clientY };
		const rect = el.getBoundingClientRect();
		const position = zoomControl.screenToFlow(point) ?? {
			x: point.x - rect.left,
			y: point.y - rect.top
		};
		drawState.addNode(type, position.x, position.y);
	};

	const handleWheel = (event: WheelEvent) => {
		event.preventDefault();
		wheelAccum += event.deltaY;
		if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) {
			return;
		}
		if (wheelAccum < 0) {
			zoomControl.zoomIn(80);
		} else {
			zoomControl.zoomOut(80);
		}
		wheelAccum = 0;
	};

	onMount(() => {
		const el = container;
		if (!el) {
			return;
		}

		drawState.container = el;
		const unbindToolbar = bindToolbarPlacement();
		el.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			unbindToolbar();
			el.removeEventListener('wheel', handleWheel);
			drawState.destroy();
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={container}
	class="arena-container bg-dark-base h-full w-full"
	role="application"
	ondragover={onDragOver}
	ondrop={onDrop}
>
	<SvelteFlow
		bind:nodes={drawState.nodes}
		bind:edges={drawState.edges}
		nodeTypes={drawState.nodeTypes}
		edgeTypes={drawState.edgeTypes}
		nodeOrigin={[0.5, 0.5]}
		deleteKey="Delete"
		minZoom={MIN_ZOOM}
		maxZoom={MAX_ZOOM}
		panOnDrag={drawState.panEnabled}
		selectionOnDrag={false}
		zoomOnScroll={false}
		zoomOnDoubleClick={false}
		preventScrolling={false}
		proOptions={{ hideAttribution: true }}
	>
		<Background
			variant={BackgroundVariant.Dots}
			gap={16}
			size={1.5}
			bgColor="transparent"
			patternColor="var(--color-dark-dots)"
		/>
		<ZoomPanel />
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow) {
		background-color: var(--color-dark-base);
		cursor: inherit !important;
	}

	:global(.svelte-flow__background) {
		background-color: var(--color-dark-base);
		background-image:
			radial-gradient(48% 42% at 16% 10%, rgba(139, 124, 246, 0.13), transparent 60%),
			radial-gradient(44% 40% at 86% 14%, rgba(74, 158, 255, 0.1), transparent 60%),
			radial-gradient(50% 46% at 82% 80%, rgba(63, 178, 122, 0.09), transparent 62%),
			radial-gradient(40% 34% at 45% 42%, rgba(255, 138, 61, 0.05), transparent 66%),
			radial-gradient(120% 90% at 50% 118%, rgba(255, 115, 38, 0.1), transparent 55%),
			radial-gradient(150% 120% at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
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
