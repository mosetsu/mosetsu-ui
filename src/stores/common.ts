import { writable } from 'svelte/store';

export type CommonStore = {
	isSimulationActive: boolean;
};

const initialState: CommonStore = {
	isSimulationActive: false
};

const createCommonStore = () => {
	const { subscribe, update } = writable<CommonStore>(initialState);

	return {
		subscribe,
		toggleSimulation: () => {
			update((state: CommonStore) => ({ ...state, isSimulationActive: !state.isSimulationActive }));
		}
	};
};

const commonStore = createCommonStore();

export default commonStore;
