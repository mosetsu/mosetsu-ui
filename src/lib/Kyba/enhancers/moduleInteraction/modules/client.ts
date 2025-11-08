import type { KybaInterface } from '../../../types';

const ClientModule = (controller: KybaInterface, cb: () => void) => {
	const { container } = controller;

	if (!container) {
		return () => {};
	}

	const tearDown = () => {
		container.style.cursor = '';
		container.removeEventListener('click', _onClick, { capture: true });
		controller.panEnabled.set(true);
	};

	const _onClick = (event: MouseEvent) => {
		// Prevent default SvelteFlow behavior
		event.stopPropagation();

		// Get click position relative to the container
		const rect = container.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Add node at click position
		controller.addNode({
			type: 'client',
			position: { x, y },
			data: { label: 'Client' }
		});

		tearDown();
		cb();
	};

	const init = () => {
		controller.panEnabled.set(false);
		container.style.cursor = 'crosshair';
		container.addEventListener('click', _onClick, { capture: true });
	};

	init();

	return tearDown;
};

export default ClientModule;
