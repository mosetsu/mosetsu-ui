import { Rect } from 'fabric';
import type { KybaInterface } from '../types';

const ClientModule = (controller: KybaInterface, cb: () => void) => {
	const { canvas } = controller;
	const fill = '#fff';
	const stroke = '#EDECEF';

	let rect: Rect;

	canvas.defaultCursor = 'crosshair';
	canvas.selectionColor = '';

	// @ts-expect-error todo add types
	const _mouseDown = (event): void => {
		const { x, y } = canvas.getViewportPoint(event.e);

		rect = new Rect({
			left: x,
			top: y,
			width: 200,
			height: 100,
			originX: 'left',
			originY: 'top',
			fill,
			stroke,
			strokeWidth: 1.5,
			rx: 8,
			ry: 8,
			selectable: true
		});
		canvas.add(rect);

		canvas.defaultCursor = 'default';
		canvas.renderAll();
		canvas.off('mouse:down', _mouseDown);
		cb();
	};

	const init = () => {
		canvas.defaultCursor = 'crosshair';
		canvas.selectionColor = '';
		canvas.on('mouse:down', _mouseDown);
	};

	init();

	return () => {};
};

export default ClientModule;
