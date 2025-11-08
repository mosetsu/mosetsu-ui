<script lang="ts">
	import commonStore from '$stores/common';
	import Arena from '$components/studio/Arena.svelte';
	import ModulesOverlay from '$components/studio/ModulesOverlay.svelte';

	let modulesOverlayVisible = $state(true);
	let arenaComponent: Arena | null = $state(null);
	let zoomLevel = $state(80);

	const onModuleBtnClick = () => {
		modulesOverlayVisible = !modulesOverlayVisible;
	};

	const handleZoomIn = () => {
		if (arenaComponent) {
			arenaComponent.handleZoomIn();
		}
	};

	const handleZoomOut = () => {
		if (arenaComponent) {
			arenaComponent.handleZoomOut();
		}
	};

	// Update zoom level display
	$effect(() => {
		const interval = setInterval(() => {
			if (arenaComponent) {
				zoomLevel = arenaComponent.getZoomLevel();
			}
		}, 100);

		return () => clearInterval(interval);
	});
</script>

<section class="relative flex h-full w-full flex-col bg-[#f5f5f5]">
	<header class="flex h-16 items-center justify-center border-b border-gray-200 bg-white p-2">
		<div class="flex flex-col text-center">
			<span class="mb-0.5 text-sm text-black">Custom Spec</span>
			<span class="text-sm text-gray-500">overview of system flow</span>
		</div>
	</header>
	<div id="arena" class="flex flex-1">
		<Arena bind:this={arenaComponent} />
	</div>
	<ModulesOverlay visible={modulesOverlayVisible} />
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
					(modulesOverlayVisible
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
</section>

<style>
	#arena {
		--grid-gap: 1.5px;
		background-image:
			linear-gradient(90deg, #fff var(--grid-gap), #0000 var(--grid-gap)),
			linear-gradient(#fff var(--grid-gap), #0000 var(--grid-gap));
		background-size: 12px 12px;
	}
</style>
