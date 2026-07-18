import toolbarStore, { TOOLBAR_NONE, type ToolbarSelection } from '$stores/toolbar';
import { drawState } from '$components/arena/helper/draw.svelte.ts';

const ToolbarAction = (): (() => void) => {
	let armedType: ToolbarSelection = TOOLBAR_NONE;
	const container = () => drawState.getContainer();
	const resetToolbar = () => {
		toolbarStore.reset();
	};

	const clickEvent = (event: MouseEvent) => {
		event.stopPropagation();
		const rect = container()?.getBoundingClientRect();

		if (!rect || !armedType) {
			return;
		}

		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		drawState.addNode(armedType, x, y);

		resetToolbar();
		removeClickEvent();
	};

	const addClickEvent = () => {
		const cont = container();
		if (cont) {
			cont.style.cursor = 'crosshair';
			cont.addEventListener('click', clickEvent, { capture: true });
		}
	};

	const removeClickEvent = () => {
		const cont = container();
		if (cont) {
			cont.style.cursor = 'default';
			cont.removeEventListener('click', clickEvent, { capture: true });
		}
	};

	const handleToolbarAction = (type: ToolbarSelection) => {
		removeClickEvent();
		armedType = type;
		if (armedType) {
			addClickEvent();
		}
	};

	const unsub = toolbarStore.subscribe(handleToolbarAction);

	return unsub;
};

export default ToolbarAction;
