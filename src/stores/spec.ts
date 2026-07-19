import { writable } from 'svelte/store';

/**
 * The spec currently open on the canvas.
 *   • id === null  → a new, never-saved spec (first Save opens the rename dialog)
 *   • id !== null  → an existing saved spec (Save silently overrides it)
 * The name is what shows in the header.
 */

export const DEFAULT_SPEC_NAME = 'Untitled Spec';

export type SpecContext = { id: string | null; name: string };

export const specStore = writable<SpecContext>({ id: null, name: DEFAULT_SPEC_NAME });

export const newSpecId = (): string =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `spec-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

export const setSpec = (ctx: SpecContext) => specStore.set(ctx);
export const resetSpec = () => specStore.set({ id: null, name: DEFAULT_SPEC_NAME });
