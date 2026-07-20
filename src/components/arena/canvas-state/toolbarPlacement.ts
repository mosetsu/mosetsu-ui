import { toolbarStore, TOOLBAR_NONE, type ToolbarSelection } from '$stores/toolbar';
import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';
import { zoomControl } from '$components/arena/canvas-state/zoom.svelte';

/**
 * While a module is selected in the dock, the next canvas click places it at
 * the clicked flow position. Returns a cleanup for unmount.
 */
export function bindToolbarPlacement(): () => void {
	let activeType: ToolbarSelection = TOOLBAR_NONE;

	const place = (event: MouseEvent) => {
		event.stopPropagation();
		const container = drawState.container;
		if (!container || !activeType) {
			return;
		}

		const point = { x: event.clientX, y: event.clientY };
		const rect = container.getBoundingClientRect();
		const position = zoomControl.screenToFlow(point) ?? {
			x: point.x - rect.left,
			y: point.y - rect.top
		};
		drawState.addNode(activeType, position.x, position.y);

		toolbarStore.reset();
	};

	const init = () => {
		const container = drawState.container;
		if (!container) {
			return;
		}
		container.style.cursor = 'crosshair';
		container.addEventListener('click', place, { capture: true });
	};

	const cleanup = () => {
		const container = drawState.container;
		if (!container) {
			return;
		}
		container.style.cursor = 'default';
		container.removeEventListener('click', place, { capture: true });
	};

	const unsubscribe = toolbarStore.subscribe((type) => {
		cleanup();
		activeType = type;
		if (activeType) {
			init();
		}
	});

	return () => {
		cleanup();
		unsubscribe();
	};
}
