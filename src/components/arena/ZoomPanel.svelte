<script lang="ts">
	import { onMount } from 'svelte';
	import { useSvelteFlow } from '@xyflow/svelte';
	import { zoomControl } from '$components/arena/canvas-state/zoom.svelte';

	const flowApi = useSvelteFlow();

	onMount(() => {
		const cleanup = zoomControl.init(flowApi);
		zoomControl.setInitialZoom();
		return cleanup;
	});
</script>
