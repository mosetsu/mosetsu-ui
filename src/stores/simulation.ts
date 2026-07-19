import { writable } from 'svelte/store';

export type SimulationState = {
	isSimulationActive: boolean;
};

const initialState: SimulationState = {
	isSimulationActive: false
};

const createSimulationStore = () => {
	const { subscribe, update } = writable<SimulationState>(initialState);

	return {
		subscribe,
		toggleSimulation: () => {
			update((state: SimulationState) => ({
				...state,
				isSimulationActive: !state.isSimulationActive
			}));
		}
	};
};

const simulationStore = createSimulationStore();

export default simulationStore;
