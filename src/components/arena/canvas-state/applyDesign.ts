import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
import { zoomControl } from '$components/arena/canvas-state/zoom.svelte';
import { hydrateDesign } from '$lib/design/serialize';
import type { SystemDesign } from '$lib/design/schema';
import { getLayout, DEFAULT_LAYOUT, type LayoutId } from '$lib/design/layouts';
import { layoutStore } from '$stores/layout';
import { selectionStore } from '$stores/selection';
import { setSpec, DEFAULT_SPEC_NAME, type SpecContext } from '$stores/spec';

type ApplyOptions = {
	/** Layout used when the design omits positions; also becomes the active layout. */
	layoutId?: LayoutId;
	/** Spec context to open under. Defaults to a new, unsaved spec named after the design. */
	spec?: SpecContext;
};

/**
 * The single path for putting a design onto the canvas — used by draft
 * restore, shared links, JSON import, and config upload.
 */
export function applyDesign(design: SystemDesign, { layoutId, spec }: ApplyOptions = {}) {
	const { nodes, edges } = hydrateDesign(design, layoutId);
	drawState.loadGraph(nodes, edges);
	selectionStore.clear();
	if (layoutId) {
		layoutStore.set(layoutId);
	}
	setSpec(spec ?? { id: null, name: (design.name ?? '').trim() || DEFAULT_SPEC_NAME });

	// hydrateDesign lays out with default sizes; once nodes render and are
	// measured, re-layout so nodes align on their centres (where edges attach).
	const needsLayout = design.nodes.some((n) => !n.position);
	if (needsLayout) {
		setTimeout(() => {
			drawState.applyLayout(getLayout(layoutId ?? DEFAULT_LAYOUT));
		}, 100);
	}
	zoomControl.fit(needsLayout ? 250 : 150);
}
