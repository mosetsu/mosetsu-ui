import { Line, Rect } from 'fabric';
import type { KybaInterface } from '$lib/Kyba/types';

const LinkModule = (controller: KybaInterface, cb: () => void) => {
	const { canvas } = controller;

	let line: Line;
	let isPressed: boolean;

	canvas.defaultCursor = 'crosshair';
	canvas.selectionColor = '';

	const tearDown = () => {
		canvas.defaultCursor = 'default';
		canvas.renderAll();
		canvas.off('mouse:down', _mouseDown);
		canvas.off('mouse:move', _mouseMove);
		canvas.off('mouse:up', _mouseUp);
	};

	// @ts-expect-error todo add types
	const _mouseDown = (event): void => {
		isPressed = true;
		const { x, y } = canvas.getViewportPoint(event.e);

		const rect = new Rect({
			left: x,
			top: y,
			width: 10,
			height: 10,
			originX: 'center',
			originY: 'center',
			fill: '#36A2DF',
			strokeWidth: 1.5,
			rx: 2,
			ry: 2,
			selectable: false,
			id: 'link-rect',
			visible: false
		});
		line = new Line([x, y, x, y], {
			strokeWidth: 2,
			stroke: '#36A2DF',
			originX: 'center',
			originY: 'center',
			selectable: false
		});

		canvas.add(line);
		canvas.add(rect);
	};

	// @ts-expect-error todo add types
	const _mouseMove = (event): void => {
		if (!isPressed) {
			return;
		}
		const { x, y } = canvas.getViewportPoint(event.e);
		line.set({ x2: x, y2: y });
		canvas.renderAll();
	};

	const _mouseUp = (): void => {
		line.selectable = true;
		line.setCoords();
		canvas.defaultCursor = 'default';
		tearDown();
		canvas.setActiveObject(line);
		cb();
	};

	const _init = () => {
		isPressed = false;
		canvas.defaultCursor = 'crosshair';
		canvas.selectionColor = '';
		canvas.on('mouse:down', _mouseDown);
		canvas.on('mouse:move', _mouseMove);
		canvas.on('mouse:up', _mouseUp);
	};

	_init();

	return tearDown;
};

export default LinkModule;
