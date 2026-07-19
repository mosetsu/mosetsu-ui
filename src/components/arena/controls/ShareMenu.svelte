<script lang="ts">
	import { fly } from 'svelte/transition';
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
	import { serializeDesign, hydrateDesign } from '$lib/design/serialize';
	import { buildShareUrl, exportDesignFile, importDesignFile } from '$lib/design/share';
	import Toast from '$components/ui/Toast.svelte';

	let open = $state(false);
	let toast = $state('');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const currentDesign = () =>
		serializeDesign(drawState.nodes, drawState.edges, {
			name: 'Custom Spec',
			updatedAt: Date.now()
		});

	const flash = (msg: string) => {
		toast = msg;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = ''), 2000);
	};

	const copy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			return false;
		}
	};

	async function shareLink() {
		const url = await buildShareUrl(currentDesign());
		flash((await copy(url)) ? 'Share link copied' : 'Copy failed');
		open = false;
	}

	async function copyConfig() {
		const json = JSON.stringify(currentDesign(), null, 2);
		flash((await copy(json)) ? 'Config JSON copied' : 'Copy failed');
		open = false;
	}

	function exportJson() {
		exportDesignFile(currentDesign());
		open = false;
	}

	async function importJson() {
		open = false;
		try {
			const design = await importDesignFile();
			const { nodes, edges } = hydrateDesign(design);
			drawState.loadGraph(nodes, edges);
			flash('Design imported');
		} catch (e) {
			flash(e instanceof Error ? e.message : 'Import failed');
		}
	}

	const items = [
		{ label: 'Copy share link', hint: 'Anyone with the link sees this design', run: shareLink },
		{ label: 'Copy config (JSON)', hint: 'The portable format — paste anywhere', run: copyConfig },
		{ label: 'Export .json', hint: 'Download the design file', run: exportJson },
		{ label: 'Import .json', hint: 'Load a design file', run: importJson }
	];
</script>

<svelte:window onclick={() => (open = false)} />

<div class="relative">
	<button
		class="border-dark-border bg-dark-elevated/60 text-text-secondary hover:border-dark-border-strong hover:text-text-primary flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none"
		onclick={(e) => {
			e.stopPropagation();
			open = !open;
		}}
	>
		<svg
			class="h-3.5 w-3.5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="18" cy="5" r="3" />
			<circle cx="6" cy="12" r="3" />
			<circle cx="18" cy="19" r="3" />
			<path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
		</svg>
		Share
	</button>

	{#if open}
		<div
			class="glass-elevated border-dark-border-strong/50 absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-xl border p-1 shadow-2xl"
			transition:fly={{ y: 8, duration: 160 }}
		>
			{#each items as item (item.label)}
				<button
					class="hover:bg-dark-highlight/70 flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left transition-colors focus:outline-none"
					onclick={item.run}
				>
					<span class="text-text-primary text-sm font-medium">{item.label}</span>
					<span class="text-text-subtle text-[11px]">{item.hint}</span>
				</button>
			{/each}
		</div>
	{/if}

	<Toast message={toast} class="absolute bottom-full left-0 mb-2" />
</div>
