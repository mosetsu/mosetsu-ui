import { writable } from 'svelte/store';

// The toolbar holds the currently-armed module type (a key in the module
// registry), or '' when nothing is selected.
export type ToolbarSelection = string;
export const TOOLBAR_NONE: ToolbarSelection = '';

const createToolbarStore = () => {
	const { subscribe, set } = writable<ToolbarSelection>(TOOLBAR_NONE);

	return {
		subscribe,
		select: (type: ToolbarSelection) => set(type),
		reset: () => set(TOOLBAR_NONE)
	};
};

const toolbarStore = createToolbarStore();

export default toolbarStore;
