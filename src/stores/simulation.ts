import { writable } from 'svelte/store';

const active = writable(false);

export const simulationStore = {
	subscribe: active.subscribe,
	toggle: () => active.update((v) => !v)
};
