<script lang="ts">
	import { onMount } from 'svelte';
	import { useSvelteFlow } from '@xyflow/svelte';
	import { zoomControl } from './helper/zoom.svelte';

	const flowApi = useSvelteFlow();

	onMount(() => {
		zoomControl.init(flowApi);
		zoomControl.setInitialZoom();
	});

	export function handleZoomIn() {
		zoomControl.zoomIn();
	}

	export function handleZoomOut() {
		zoomControl.zoomOut();
	}

	export function getZoomLevel() {
		return zoomControl.getZoomLevel();
	}
</script>
