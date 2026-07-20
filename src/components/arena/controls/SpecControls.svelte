<script lang="ts">
	import { get } from 'svelte/store';
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
	import { selectionStore } from '$stores/selection';
	import { specStore, setSpec, resetSpec, newSpecId, DEFAULT_SPEC_NAME } from '$stores/spec';
	import { serializeDesign } from '$lib/design/serialize';
	import { saveSpec, clearDraft } from '$lib/design/persistence';
	import SaveSpecDialog from '$components/dialogs/SaveSpecDialog.svelte';
	import ConfirmDialog from '$components/dialogs/ConfirmDialog.svelte';
	import { createToast } from '$lib/toast.svelte';
	import Toast from '$components/ui/Toast.svelte';

	let showSave = $state(false);
	let showNew = $state(false);
	let saveInitial = $state('');
	const toast = createToast(1800);

	const buildDesign = (id: string, name: string) =>
		serializeDesign(drawState.nodes, drawState.edges, { id, name, updatedAt: Date.now() });

	function onSaveClick() {
		const spec = get(specStore);
		if (spec.id === null) {
			// First save of a new spec → ask for a name once.
			saveInitial = spec.name === DEFAULT_SPEC_NAME ? '' : spec.name;
			showSave = true;
		} else {
			// Existing spec → silently override.
			void saveSpec(buildDesign(spec.id, spec.name));
			toast.show('Saved');
		}
	}

	function confirmSave(name: string) {
		const spec = get(specStore);
		const finalName = name.trim() || DEFAULT_SPEC_NAME;
		const id = spec.id ?? newSpecId();
		setSpec({ id, name: finalName });
		void saveSpec(buildDesign(id, finalName));
		showSave = false;
		toast.show(`Saved “${finalName}”`);
	}

	function onNewClick() {
		if (drawState.nodes.length === 0) {
			doNew();
		} else {
			showNew = true;
		}
	}

	function doNew() {
		drawState.clearGraph();
		selectionStore.clear();
		resetSpec();
		void clearDraft();
		showNew = false;
	}
</script>

<button
	class="border-accent-primary/40 bg-accent-primary/10 text-accent-hover hover:bg-accent-primary flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all hover:text-white focus:outline-none"
	onclick={onSaveClick}
	title="Save this spec"
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
		<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
		<path d="M17 21v-8H7v8M7 3v5h8" />
	</svg>
	Save
</button>

<button
	class="border-dark-border bg-dark-elevated/60 text-text-secondary hover:border-dark-border-strong hover:text-text-primary flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none"
	onclick={onNewClick}
	title="Start a new spec"
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
		<path d="M12 5v14M5 12h14" />
	</svg>
	New
</button>

<Toast message={toast.message} class="absolute -top-11 left-1/2 -translate-x-1/2" />

<SaveSpecDialog
	open={showSave}
	initial={saveInitial}
	onsave={confirmSave}
	oncancel={() => (showSave = false)}
/>

<ConfirmDialog
	open={showNew}
	title="Start a new spec?"
	message="The canvas will be cleared. Any saved specs stay in Explore, but unsaved changes to the current draft will be discarded."
	confirmLabel="New spec"
	onconfirm={doNew}
	oncancel={() => (showNew = false)}
/>
