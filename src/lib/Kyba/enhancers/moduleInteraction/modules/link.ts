import type { KybaInterface } from '$lib/Kyba/types';

const LinkModule = (controller: KybaInterface, cb: () => void) => {
	const { container } = controller;

	if (!container) {
		return () => {};
	}

	let isPressed = false;
	let startX = 0;
	let startY = 0;
	let tempLine: SVGLineElement | null = null;
	let svgOverlay: SVGSVGElement | null = null;

	const tearDown = () => {
		container.style.cursor = '';
		container.removeEventListener('mousedown', _mouseDown, { capture: true });
		container.removeEventListener('mousemove', _mouseMove, { capture: true });
		container.removeEventListener('mouseup', _mouseUp, { capture: true });
		controller.panEnabled.set(true);
		if (svgOverlay && svgOverlay.parentNode) {
			svgOverlay.parentNode.removeChild(svgOverlay);
		}
	};

	// Create SVG overlay for temporary line drawing
	const createSVGOverlay = () => {
		svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgOverlay.style.position = 'absolute';
		svgOverlay.style.top = '0';
		svgOverlay.style.left = '0';
		svgOverlay.style.width = '100%';
		svgOverlay.style.height = '100%';
		svgOverlay.style.pointerEvents = 'none';
		svgOverlay.style.zIndex = '1000';
		container.appendChild(svgOverlay);
	};

	const _mouseDown = (event: MouseEvent) => {
		event.stopPropagation();
		event.preventDefault();

		isPressed = true;
		const rect = container.getBoundingClientRect();
		startX = event.clientX - rect.left;
		startY = event.clientY - rect.top;

		if (!svgOverlay) {
			createSVGOverlay();
		}

		// Create temporary line for visual feedback
		tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		tempLine.setAttribute('x1', startX.toString());
		tempLine.setAttribute('y1', startY.toString());
		tempLine.setAttribute('x2', startX.toString());
		tempLine.setAttribute('y2', startY.toString());
		tempLine.setAttribute('stroke', '#36A2DF');
		tempLine.setAttribute('stroke-width', '2');
		svgOverlay?.appendChild(tempLine);
	};

	const _mouseMove = (event: MouseEvent) => {
		if (!isPressed || !tempLine) {
			return;
		}
		const rect = container.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		tempLine.setAttribute('x2', x.toString());
		tempLine.setAttribute('y2', y.toString());
	};

	const _mouseUp = (event: MouseEvent) => {
		if (!isPressed) {
			return;
		}

		const rect = container.getBoundingClientRect();
		const endX = event.clientX - rect.left;
		const endY = event.clientY - rect.top;

		// Create helper nodes at start and end positions
		const sourceId = controller.addNode({
			type: 'client',
			position: { x: startX - 100, y: startY - 50 },
			data: { label: 'Start' }
		});

		const targetId = controller.addNode({
			type: 'client',
			position: { x: endX - 100, y: endY - 50 },
			data: { label: 'End' }
		});

		// Create edge connecting the two nodes
		controller.addEdge({
			type: 'animated',
			source: sourceId,
			target: targetId,
			data: { animated: false }
		});

		// Clean up temporary line
		if (tempLine && svgOverlay) {
			svgOverlay.removeChild(tempLine);
		}

		isPressed = false;
		tearDown();
		cb();
	};

	const _init = () => {
		controller.panEnabled.set(false);
		container.style.cursor = 'crosshair';
		container.addEventListener('mousedown', _mouseDown, { capture: true });
		container.addEventListener('mousemove', _mouseMove, { capture: true });
		container.addEventListener('mouseup', _mouseUp, { capture: true });
	};

	_init();

	return tearDown;
};

export default LinkModule;
