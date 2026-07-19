import { writable } from 'svelte/store';

// Shared open/closed state for the right-side Tooling panel so nodes can
// request it to open (on double-click) without the panel auto-opening on
// every selection.
export const toolingCollapsed = writable<boolean>(true);

/** Open the tooling panel (no-op if already open). */
export const openTooling = () => toolingCollapsed.set(false);
export const toggleTooling = () => toolingCollapsed.update((v) => !v);
