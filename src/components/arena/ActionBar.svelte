<script lang="ts">
	import { simulationStore } from '$stores/simulation';
	import ShareMenu from '$components/arena/controls/ShareMenu.svelte';
	import SpecControls from '$components/arena/controls/SpecControls.svelte';
	import ZoomControls from '$components/arena/controls/ZoomControls.svelte';
	import UploadControls from '$components/arena/controls/UploadControls.svelte';
	import LayoutToggle from '$components/arena/controls/LayoutToggle.svelte';

	let { activeTray, onModuleBtnClick, onBlankBtnClick } = $props();

	let simulationActive = $derived($simulationStore);

	const trayBtnClass = (open: boolean) =>
		`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none ` +
		(open
			? 'border-accent-primary/40 bg-accent-primary/15 text-accent-hover'
			: 'border-dark-border bg-dark-elevated/60 text-text-secondary hover:border-dark-border-strong hover:text-text-primary');
</script>

<footer
	class="glass-elevated border-dark-border-strong/40 absolute bottom-4 left-1/2 z-20 flex h-14 w-[calc(100%-14rem)] -translate-x-1/2 items-center justify-center rounded-2xl border px-4 shadow-2xl"
>
	<div class="flex w-full items-center gap-3">
		<!-- Left group: document actions -->
		<div class="flex flex-1 items-center justify-start gap-2">
			<SpecControls />
			<ShareMenu />
			<UploadControls />
		</div>

		<!-- Center: primary action -->
		<div class="flex flex-1 justify-center">
			<button
				class={`group flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm font-semibold transition-all focus:outline-none ` +
					(simulationActive
						? 'bg-accent-primary glow-accent hover:bg-accent-hover border-transparent text-white'
						: 'border-accent-primary/50 bg-accent-primary/10 text-accent-hover glow-soft hover:bg-accent-primary hover:text-white')}
				onclick={simulationStore.toggle}
			>
				<span
					class={`inline-block h-2 w-2 rounded-full transition-all ` +
						(simulationActive ? 'animate-pulse bg-white' : 'bg-accent-primary')}
				></span>
				{simulationActive ? 'Stop' : 'Run'} Simulation</button
			>
		</div>

		<!-- Right group: canvas controls -->
		<div class="flex flex-1 items-center justify-end gap-2">
			<button class={trayBtnClass(activeTray === 'modules')} onclick={onModuleBtnClick}>
				Modules
			</button>
			<button class={trayBtnClass(activeTray === 'blanks')} onclick={onBlankBtnClick}>
				Blanks
			</button>
			<LayoutToggle />
			<ZoomControls />
		</div>
	</div>
</footer>
