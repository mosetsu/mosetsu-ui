import toolbarStore, { ToolbarMenu } from '$stores/toolbar';
import { drawState } from '$components/arena/helper/draw.svelte.ts';

const ToolbarAction = (): (() => void) => {
	let lastSelectedMenu: ToolbarMenu | null = null;
	const container = () => drawState.getContainer();
	const resetToolbar = () => {
		toolbarStore.reset();
	};

	const clickEvent = (event: MouseEvent) => {
		event.stopPropagation();
		const rect = container()?.getBoundingClientRect();

		if (!rect) {
			return;
		}

		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		if (lastSelectedMenu === ToolbarMenu.CLIENT) {
			drawState.addClientNode(x, y);
		} else if (lastSelectedMenu === ToolbarMenu.SERVER) {
			drawState.addServerNode(x, y);
		}

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

	const handleToolbarAction = (toolbarMenu: ToolbarMenu) => {
		removeClickEvent();
		lastSelectedMenu = toolbarMenu;
		if (lastSelectedMenu) {
			addClickEvent();
		}
	};

	const unsub = toolbarStore.subscribe(handleToolbarAction);

	return unsub;
};

export default ToolbarAction;
