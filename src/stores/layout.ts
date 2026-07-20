import { writable } from 'svelte/store';
import { DEFAULT_LAYOUT, type LayoutId } from '$lib/design/layouts';

// The layout currently applied to the canvas (drives the footer toggle's
// active state and the upload dialog's default).
export const layoutStore = writable<LayoutId>(DEFAULT_LAYOUT);
