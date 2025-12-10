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

	let simulationActive = $derived($commonStore.isSimulationActive);
</script>

<footer
	class="border-dark-border bg-dark-surface z-10 mt-auto flex h-16 items-center justify-between border-t px-4 py-2"
>
	<div class="flex items-center gap-2">
		<button
			class="border-dark-border bg-dark-elevated text-text-secondary hover:bg-dark-highlight cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none"
			>Share</button
		>
		<button
			class={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none ` +
				(toolbarVisible
					? 'bg-accent-primary hover:bg-accent-hover border-transparent text-white'
					: 'border-dark-border bg-dark-elevated text-text-secondary hover:bg-dark-highlight')}
			onclick={onModuleBtnClick}>Modules</button
		>
	</div>

	<button
		class={`cursor-pointer rounded-lg border px-4 py-1.5 text-sm font-medium transition-all focus:outline-none ` +
			(simulationActive
				? 'bg-accent-primary hover:bg-accent-hover border-transparent text-white'
				: 'border-dark-border bg-dark-elevated text-text-secondary hover:bg-dark-highlight')}
		onclick={() => commonStore.toggleSimulation()}
		>{simulationActive ? 'Stop' : 'Run'} Simulation</button
	>

	<div class="flex items-center gap-1">
		<button
			class="border-dark-border bg-dark-elevated text-text-secondary hover:bg-dark-highlight cursor-pointer rounded-lg border px-2.5 py-1.5 text-sm transition-all focus:outline-none"
			onclick={handleZoomOut}
			title="Zoom out"
		>
			−
		</button>
		<span class="text-text-subtle min-w-[3rem] text-center text-sm">{zoomControl.zoomLevel}%</span>
		<button
			class="border-dark-border bg-dark-elevated text-text-secondary hover:bg-dark-highlight cursor-pointer rounded-lg border px-2.5 py-1.5 text-sm transition-all focus:outline-none"
			onclick={handleZoomIn}
			title="Zoom in"
		>
			+
		</button>
	</div>
</footer>
