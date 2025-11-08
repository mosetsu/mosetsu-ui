import commonStore from '$stores/common';
import type { KybaInterface } from '$lib/Kyba/types';

const Simulation = (controller: KybaInterface): (() => void) => {
	const { edges } = controller;

	const unsub = commonStore.subscribe((state) => {
		const isSimActive = state.isSimulationActive;

		// Update all edges to be animated or not based on simulation state
		edges.update((currentEdges) => {
			return currentEdges.map((edge) => ({
				...edge,
				data: {
					...edge.data,
					animated: isSimActive
				}
			}));
		});
	});

	return unsub;
};

export default Simulation;
