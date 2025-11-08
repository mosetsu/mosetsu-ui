<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { SvelteFlow, Background, BackgroundVariant } from '@xyflow/svelte';
	import type { Node, Edge } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import KybaController from '$lib/Kyba/main';
	import ModuleInteraction from '$lib/Kyba/enhancers/moduleInteraction/moduleInteraction';
	import Simulation from '$lib/Kyba/enhancers/simulation';
	import ClientNode from './ClientNode.svelte';
	import AnimatedEdge from '$components/studio/AnimatedEdge.svelte';
	import ZoomPanel from '$components/studio/ZoomPanel.svelte';
	import type { KybaInterface } from '$lib/Kyba/types';

	// Define component types
	type NodeTypes = Record<string, any>;
	type EdgeTypes = Record<string, any>;

	let container: HTMLDivElement;
	let controller: KybaInterface | undefined = $state();
	let nodes: Node[] = $state([]);
	let edges: Edge[] = $state([]);
	let panEnabled: boolean = $state(true);
	let zoomPanelComponent: any = $state(null);

	const nodeTypes: NodeTypes = {
		client: ClientNode as any
	};

	const edgeTypes: EdgeTypes = {
		animated: AnimatedEdge as any
	};

	// Export zoom functions for toolbar
	export function handleZoomIn() {
		if (zoomPanelComponent) {
			zoomPanelComponent.handleZoomIn();
		}
	}

	export function handleZoomOut() {
		if (zoomPanelComponent) {
			zoomPanelComponent.handleZoomOut();
		}
	}

	export function getZoomLevel() {
		if (zoomPanelComponent) {
			return zoomPanelComponent.getZoomLevel();
		}
		return 80;
	}

	onMount(() => {
		if (container) {
			controller = KybaController({
				container,
				enhancers: [ModuleInteraction, Simulation]
			});

			// Subscribe to store updates
			controller.nodes.subscribe((n: Node[]) => {
				nodes = n;
			});

			controller.edges.subscribe((e: Edge[]) => {
				edges = e;
			});

			controller.panEnabled.subscribe((p: boolean) => {
				panEnabled = p;
			});

			// Make controller available to child components
			setContext('kyba', controller);
		}
	});
</script>

<div bind:this={container} style="width: 100%; height: 100%;" class="arena-container">
	{#if controller}
		<SvelteFlow
			{nodes}
			{edges}
			{nodeTypes}
			{edgeTypes}
			deleteKey="Delete"
			minZoom={0.1}
			maxZoom={4}
			panOnDrag={panEnabled}
			selectionOnDrag={false}
			zoomOnScroll={true}
			preventScrolling={false}
			proOptions={{ hideAttribution: true }}
		>
			<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
			<ZoomPanel bind:this={zoomPanelComponent} />
		</SvelteFlow>
	{/if}
</div>

<style>
	.arena-container {
		cursor: inherit;
	}

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
