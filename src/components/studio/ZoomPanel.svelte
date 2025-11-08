<script lang="ts">
	import { onMount } from 'svelte';
	import { useSvelteFlow } from '@xyflow/svelte';

	const { zoomIn, zoomOut, getViewport, setViewport } = useSvelteFlow();

	let zoomLevel = $state(80);

	// Update zoom level when viewport changes
	$effect(() => {
		const interval = setInterval(() => {
			try {
				const viewport = getViewport();
				zoomLevel = Math.round(viewport.zoom * 100);
			} catch (e) {
				// Viewport not ready yet
			}
		}, 100);

		return () => clearInterval(interval);
	});

	export function handleZoomIn() {
		zoomIn();
	}

	export function handleZoomOut() {
		zoomOut();
	}

	export function getZoomLevel() {
		return zoomLevel;
	}

	// Set initial zoom to 80% on mount
	onMount(() => {
		setTimeout(() => {
			try {
				setViewport({ x: 0, y: 0, zoom: 0.8 });
			} catch (e) {
				// Viewport not ready yet
			}
		}, 100);
	});
</script>

<!-- This component doesn't render anything, just provides zoom functions -->
