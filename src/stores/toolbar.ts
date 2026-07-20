import { writable } from 'svelte/store';

// The toolbar holds the currently-armed module type (a key in the module
// registry), or '' when nothing is selected.
export type ToolbarSelection = string;
export const TOOLBAR_NONE: ToolbarSelection = '';

const selected = writable<ToolbarSelection>(TOOLBAR_NONE);

export const toolbarStore = {
	subscribe: selected.subscribe,
	select: (type: ToolbarSelection) => selected.set(type),
	reset: () => selected.set(TOOLBAR_NONE)
};
