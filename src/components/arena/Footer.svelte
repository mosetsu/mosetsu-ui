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
	class="glass-elevated border-dark-border-strong/40 relative z-20 mx-auto mt-auto mb-4 flex h-14 w-[82%] max-w-4xl items-center justify-between rounded-2xl border px-3 shadow-2xl"
>
	<div class="flex items-center gap-2">
		<button
			class="border-dark-border bg-dark-elevated/60 text-text-secondary hover:border-dark-border-strong hover:text-text-primary cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none"
			>Share</button
		>
		<button
			class={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none ` +
				(toolbarVisible
					? 'border-accent-primary/40 bg-accent-primary/15 text-accent-hover'
					: 'border-dark-border bg-dark-elevated/60 text-text-secondary hover:border-dark-border-strong hover:text-text-primary')}
			onclick={onModuleBtnClick}>Modules</button
		>
	</div>

	<button
		class={`group flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm font-semibold transition-all focus:outline-none ` +
			(simulationActive
				? 'border-transparent bg-accent-primary text-white glow-accent hover:bg-accent-hover'
				: 'border-accent-primary/50 bg-accent-primary/10 text-accent-hover glow-soft hover:bg-accent-primary hover:text-white')}
		onclick={() => commonStore.toggleSimulation()}
	>
		<span
			class={`inline-block h-2 w-2 rounded-full transition-all ` +
				(simulationActive ? 'animate-pulse bg-white' : 'bg-accent-primary')}
		></span>
		{simulationActive ? 'Stop' : 'Run'} Simulation</button
	>

	<div class="border-dark-border bg-dark-elevated/60 flex items-center gap-1 rounded-lg border p-0.5">
		<button
			class="text-text-secondary hover:bg-dark-highlight hover:text-text-primary cursor-pointer rounded-md px-2.5 py-1 text-sm transition-all focus:outline-none"
			onclick={handleZoomOut}
			title="Zoom out"
		>
			−
		</button>
		<span class="text-text-subtle min-w-[3rem] text-center font-mono text-xs">{zoomControl.zoomLevel}%</span>
		<button
			class="text-text-secondary hover:bg-dark-highlight hover:text-text-primary cursor-pointer rounded-md px-2.5 py-1 text-sm transition-all focus:outline-none"
			onclick={handleZoomIn}
			title="Zoom in"
		>
			+
		</button>
	</div>
</footer>
