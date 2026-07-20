<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
	import { applyDesign } from '$components/arena/canvas-state/applyDesign';
	import { serializeDesign } from '$lib/design/serialize';
	import { createAutosaver, loadDraft } from '$lib/design/persistence';
	import { readDesignFromHash, clearHash } from '$lib/design/share';
	import { specStore, DEFAULT_SPEC_NAME } from '$stores/spec';

	let ready = $state(false);

	// The draft carries the current spec context (id/name) so restoring resumes
	// exactly where the user left off — including which saved spec it belongs to.
	const autosaver = createAutosaver(() => {
		const spec = get(specStore);
		return serializeDesign(drawState.nodes, drawState.edges, {
			id: spec.id ?? undefined,
			name: spec.name,
			updatedAt: Date.now()
		});
	});

	onMount(() => {
		let disposed = false;

		(async () => {
			// A shared link (URL hash) wins; it opens as a NEW unsaved spec so the
			// viewer can save their own copy. Otherwise resume the local draft.
			let design = await readDesignFromHash();
			const fromShare = design !== null;
			if (fromShare) {
				clearHash();
			} else {
				design = await loadDraft();
			}

			if (!disposed && design && design.nodes.length > 0) {
				applyDesign(design, {
					spec: {
						id: fromShare ? null : (design.id ?? null),
						name: design.name ?? DEFAULT_SPEC_NAME
					}
				});
			}
			ready = true;
		})();

		const flush = () => autosaver.flush();
		window.addEventListener('beforeunload', flush);

		return () => {
			disposed = true;
			window.removeEventListener('beforeunload', flush);
			autosaver.flush();
		};
	});

	// Autosave the draft whenever the graph (or spec name/id) changes.
	$effect(() => {
		void drawState.nodes;
		void drawState.edges;
		void $specStore;
		if (!ready) {
			return;
		}
		autosaver.schedule();
	});
</script>
