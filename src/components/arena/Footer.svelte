<script lang="ts">
	import commonStore from '$stores/common';

	let { toolbarVisible, onModuleBtnClick } = $props();
	let zoomLevel = $state(90);

	const handleZoomIn = () => {};
	const handleZoomOut = () => {};
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
		class="cursor-pointer rounded border border-gray-300 px-3 py-1 text-xs text-black hover:bg-gray-100 focus:outline-none"
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
		<span class="min-w-[3rem] text-center text-xs text-gray-600">{zoomLevel}%</span>
		<button
			class="cursor-pointer rounded border border-gray-300 px-2 py-1 text-sm text-black hover:bg-gray-100 focus:outline-none"
			onclick={handleZoomIn}
			title="Zoom in"
		>
			+
		</button>
	</div>
</footer>
