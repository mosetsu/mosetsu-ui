<script lang="ts">
	import commonStore from '$stores/common';
	import { zoomControl } from './helper/zoom.svelte';

	let { toolbarVisible, onModuleBtnClick } = $props();

	const handleZoomIn = () => {
		zoomControl.zoomIn();
	};

	const handleZoomOut = () => {
		zoomControl.zoomOut();
	};

	// Use $derived to make it reactive in Svelte 5
	let simulationActive = $derived($commonStore.isSimulationActive);
</script>

<footer
	class="z-10 mt-auto flex h-14 items-center justify-between border-t border-gray-200 bg-white px-3 py-2"
>
	<div class="flex items-center gap-2">
		<button
			class="cursor-pointer rounded border border-gray-300 px-3 py-1 text-xs text-black hover:bg-gray-100 focus:outline-none"
			>Share</button
		>
		<button
			class={`cursor-pointer rounded border px-3 py-1 text-xs focus:outline-none ` +
				(toolbarVisible
					? 'border-transparent bg-blue-400 text-white hover:bg-blue-300'
					: 'border-gray-300 text-black hover:bg-gray-100')}
			onclick={onModuleBtnClick}>Modules</button
		>
	</div>

	<button
		class={`cursor-pointer rounded border px-3 py-1 text-xs focus:outline-none ` +
			(simulationActive
				? 'border-transparent bg-blue-400 text-white hover:bg-blue-300'
				: 'border-gray-300 text-black hover:bg-gray-100')}
		onclick={() => commonStore.toggleSimulation()}>Start Simulation</button
	>

	<div class="flex items-center gap-2">
		<button
			class="cursor-pointer rounded border border-gray-300 px-2 py-1 text-sm text-black hover:bg-gray-100 focus:outline-none"
			onclick={handleZoomOut}
			title="Zoom out"
		>
			−
		</button>
		<span class="min-w-[3rem] text-center text-xs text-gray-600">{zoomControl.zoomLevel}%</span>
		<button
			class="cursor-pointer rounded border border-gray-300 px-2 py-1 text-sm text-black hover:bg-gray-100 focus:outline-none"
			onclick={handleZoomIn}
			title="Zoom in"
		>
			+
		</button>
	</div>
</footer>
