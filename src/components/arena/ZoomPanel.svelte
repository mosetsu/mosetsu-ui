<script lang="ts">
	import { onMount } from 'svelte';
	import { useSvelteFlow } from '@xyflow/svelte';

	const { zoomIn, zoomOut, getViewport, setViewport } = useSvelteFlow();

	let zoomLevel = $state(90);

	$effect(() => {
		const interval = setInterval(() => {
			try {
				const viewport = getViewport();
				zoomLevel = Math.round(viewport.zoom * 100);
			} catch (_) {}
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

	onMount(() => {
		setTimeout(() => {
			try {
				setViewport({ x: 0, y: 0, zoom: 0.9 });
			} catch (_) {}
		}, 100);
	});
</script>
