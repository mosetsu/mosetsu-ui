import gsap from 'gsap';
import commonStore from '$stores/common';
import type { Rect, Line } from 'fabric';
import type { KybaInterface } from '$lib/Kyba/types';

const Simulation = (controller: KybaInterface): (() => void) => {
	const { canvas } = controller;

	const unsub = commonStore.subscribe((state) => {
		const isSimActive = state.isSimulationActive;

		if (isSimActive) {
			// @ts-expect-error id is not defined in fabric types
			const rect = canvas.getObjects().filter((obj) => obj.id === 'link-rect')[0] as
				| Rect
				| undefined;
			const line = canvas.getObjects().filter((obj) => obj.type === 'line')[0] as Line | undefined;

			if (!rect || !line) {
				console.warn('No link rectangles found in the canvas.');
				return;
			}

			gsap.to(rect, {
				visible: true,
				left: line.x2,
				top: line.y2,
				duration: 1.5,
				ease: 'power1.inOut',
				yoyo: true,
				repeat: -1,
				onUpdate: () => {
					canvas.requestRenderAll();
				}
			});
		}
	});

	return unsub;
};

export default Simulation;
