<script lang="ts">
	import { get } from 'svelte/store';
	import { simulationStore } from '$stores/simulation';
	import { specStore, setSpec, DEFAULT_SPEC_NAME } from '$stores/spec';
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
	import { serializeDesign } from '$lib/design/serialize';
	import { saveSpec } from '$lib/design/persistence';

	let simulationActive = $derived($simulationStore);

	let editing = $state(false);
	let draftName = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	function startEdit() {
		draftName = $specStore.name;
		editing = true;
	}

	function commit() {
		if (!editing) {
			return;
		}
		editing = false;
		const name = draftName.trim() || DEFAULT_SPEC_NAME;
		const spec = get(specStore);
		setSpec({ ...spec, name });
		// Renaming an already-saved spec updates its saved copy immediately.
		if (spec.id) {
			void saveSpec(
				serializeDesign(drawState.nodes, drawState.edges, {
					id: spec.id,
					name,
					updatedAt: Date.now()
				})
			);
		}
	}

	function cancel() {
		editing = false;
	}

	$effect(() => {
		if (editing && inputEl) {
			inputEl.focus();
			inputEl.select();
		}
	});
</script>

<div
	class="glass-elevated border-dark-border-strong/40 flex items-center gap-2.5 rounded-full border px-4 py-2 shadow-xl"
>
	<span
		class={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase transition-colors duration-300 ` +
			(simulationActive
				? 'border-accent-primary/40 bg-accent-primary/10 text-accent-hover'
				: 'border-dark-border-strong/50 bg-dark-elevated text-text-subtle')}
	>
		<span
			class={`inline-block h-1.5 w-1.5 rounded-full ` +
				(simulationActive ? 'bg-accent-primary animate-pulse' : 'bg-text-faint')}
		></span>
		{simulationActive ? 'Live' : 'Idle'}
	</span>

	{#if editing}
		<input
			bind:this={inputEl}
			bind:value={draftName}
			class="border-dark-border bg-dark-surface text-text-primary focus:border-accent-primary/60 w-44 rounded-md border px-2 py-0.5 text-sm font-semibold outline-none"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					commit();
				} else if (e.key === 'Escape') {
					cancel();
				}
			}}
			onblur={commit}
		/>
	{:else}
		<button
			class="text-text-primary hover:bg-dark-highlight/60 max-w-[240px] cursor-pointer truncate rounded-md px-1.5 py-0.5 text-sm font-semibold tracking-tight transition-colors"
			onclick={startEdit}
			title="Rename spec"
		>
			{$specStore.name}
		</button>
	{/if}

	<span class="text-text-subtle hidden text-xs sm:inline">overview of system flow</span>
</div>
