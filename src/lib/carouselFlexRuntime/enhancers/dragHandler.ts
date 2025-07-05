/* eslint-disable @typescript-eslint/no-explicit-any */
import { elems, Events, prevent, getSign, stop } from '../utils';
import { DOMEventType, CarouselFlexEventType } from '../events';

import type { CarouselFlexController } from '../types';

const DragHandler = (controller: CarouselFlexController): (() => void) => {
	const events = Events();
	const breakFactorValue = 2;
	let container: HTMLElement;
	let direction: number;
	const defaultDirection = 1;
	let containerSize: number;
	let windowSize: number;
	let dragActive: boolean;
	let dragSpeed: (value: number) => number;
	let dragIdentifier: string;
	let dragJustStarted: boolean;
	let lastValue: number;
	let sumDistance: number;
	let isProperDrag: boolean;
	let lastX: number;
	let lastY: number;
	let isScrollTouchEnabled: boolean;
	let scrollLock: boolean;
	let min: number;
	let max: number;

	const setSpeed = (): void => {
		const speed = controller.options.dragSpeed || 1;
		dragSpeed = typeof speed === 'function' ? speed : (val) => val * (speed as number);
	};

	const isVertical = (): boolean => !!controller.options.isLayoutVertical;

	const getMovementAxis = (e: any): number => (isVertical() ? e.y : e.x);

	const isValidSlideDirection = (e: any): boolean => {
		const vertical = isVertical();
		const x = vertical ? e.y : e.x;
		const y = vertical ? e.x : e.y;
		const isSlide =
			lastX !== undefined && lastY !== undefined && Math.abs(lastY - y) <= Math.abs(lastX - x);
		lastX = x;
		lastY = y;

		return isSlide;
	};

	const setSizes = (): void => {
		containerSize = controller.config.containerSize;
		windowSize = isVertical() ? window.innerHeight : window.innerWidth;
		const details = controller.track.details;
		if (!details) {
			return;
		}
		min = details.min;
		max = details.max;
	};

	const preventClick = (e: any): void => {
		if (isProperDrag) {
			stop(e);
			prevent(e);
		}
	};

	const preventClicks = (): void => {
		const attr = `data-carousel-clickable`;
		elems(`[${attr}]:not([${attr}=false])`, container).map((clickable) => {
			events.add(clickable, DOMEventType.DRAG_START, stop);
			events.add(clickable, DOMEventType.MOUSE_DOWN, stop);
			events.add(clickable, DOMEventType.TOUCH_START, stop);
		});
	};

	const preventScrolling = (element: HTMLElement): void => {
		let start: number;
		events.input(
			element,
			DOMEventType.TOUCH_START,
			(e) => {
				start = getMovementAxis(e);
				scrollLock = true;
				isScrollTouchEnabled = true;
			},
			{ passive: true }
		);
		events.input(element, DOMEventType.TOUCH_MOVE, (e) => {
			const vertical = isVertical();
			const maxPosition = vertical
				? element.scrollHeight - element.clientHeight
				: element.scrollWidth - element.clientWidth;
			const direction = start - getMovementAxis(e);
			const position = vertical ? element.scrollTop : element.scrollLeft;
			const scrollingEnabled =
				(vertical && element.style.overflowY === 'scroll') ||
				(!vertical && element.style.overflowX === 'scroll');

			start = getMovementAxis(e);
			if (
				((direction < 0 && position > 0) || (direction > 0 && position < maxPosition)) &&
				isScrollTouchEnabled &&
				scrollingEnabled
			)
				return (scrollLock = true);

			isScrollTouchEnabled = false;
			prevent(e);
			scrollLock = false;
		});

		events.input(element, DOMEventType.TOUCH_END, () => {
			scrollLock = false;
		});
	};

	const applyRubberbandEffect = (distance: number): number => {
		if (min === -Infinity && max === Infinity) {
			return distance;
		}

		const details = controller.track.details;
		const length = details.length;
		const position = details.position;

		if (length === 0) {
			return 0;
		}
		if (position <= max && position >= min) {
			return distance;
		}
		if ((position < min && direction > 0) || (position > max && direction < 0)) {
			return distance;
		}
		const overflow = (position < min ? position - min : position - max) / length;
		const trackSize = containerSize * length;
		const overflowedSize = Math.abs(overflow * trackSize);
		const p = Math.max(0, 1 - (overflowedSize / windowSize) * breakFactorValue);

		return p * p * distance;
	};

	const dragStart = (e: any): void => {
		if (dragActive || !controller.track.details || !controller.track.details.length) {
			return;
		}

		sumDistance = 0;
		dragActive = true;
		isProperDrag = false;
		dragJustStarted = true;
		dragIdentifier = e.id;
		isValidSlideDirection(e);
		lastValue = getMovementAxis(e);
		controller.dispatch(CarouselFlexEventType.DRAG_STARTED);
	};

	const dragStop = (e: any): void => {
		if (!dragActive || dragIdentifier !== e.idChanged) {
			return;
		}
		dragActive = false;
		controller.dispatch(CarouselFlexEventType.DRAG_ENDED);
	};

	const drag = (e: any): void => {
		if (!dragActive || dragIdentifier !== e.id) {
			return;
		}
		const value = getMovementAxis(e);

		if (dragJustStarted) {
			if (!isValidSlideDirection(e)) {
				return dragStop(e);
			}
			lastValue = value;
			dragJustStarted = false;
			controller.dispatch(CarouselFlexEventType.DRAG_CHECKED);
		}

		if (scrollLock) {
			lastValue = value;
			return;
		}
		prevent(e);
		const distance = applyRubberbandEffect(
			(dragSpeed(lastValue - value) / containerSize) * defaultDirection
		);
		direction = getSign(distance);
		const position = controller.track.details.position;

		if (
			(position > min && position < max) ||
			(position === min && direction > 0) ||
			(position === max && direction < 0)
		) {
			stop(e);
		}
		sumDistance += distance;
		if (!isProperDrag && Math.abs(sumDistance * containerSize) > 5) {
			isProperDrag = true;
		}
		controller.track.add(distance);
		lastValue = value;
		controller.dispatch(CarouselFlexEventType.DRAGGED);
	};

	const update = (): void => {
		events.purge();
		setSpeed();
		setSizes();
		container = controller.options.container;
		preventClicks();
		events.add(container, DOMEventType.DRAG_START, (e) => {
			prevent(e);
		});
		events.add(container, DOMEventType.CLICK, preventClick, { capture: true });
		// events.input(container, 'ksDragStart', dragStart);
		// events.input(container, 'ksDrag', drag);
		// events.input(container, 'ksDragEnd', dragStop);
		events.input(container, DOMEventType.MOUSE_DOWN, dragStart);
		events.input(container, DOMEventType.MOUSE_MOVE, drag);
		events.input(container, DOMEventType.MOUSE_LEAVE, dragStop);
		events.input(container, DOMEventType.MOUSE_UP, dragStop);
		events.input(container, DOMEventType.TOUCH_START, dragStart, { passive: true });
		events.input(container, DOMEventType.TOUCH_MOVE, drag, { passive: false });
		events.input(container, DOMEventType.TOUCH_END, dragStop);
		events.input(container, DOMEventType.TOUCH_CANCEL, dragStop);
		events.add(window, DOMEventType.WHEEL, (e) => {
			if (dragActive) {
				prevent(e);
			}
		});
		const attr = 'data-carousel-scrollable';
		elems(`[${attr}]:not([${attr}=false])`, controller.options.container).map((element) =>
			preventScrolling(element)
		);
	};

	controller.sub(CarouselFlexEventType.UPDATED, setSizes);
	controller.sub(CarouselFlexEventType.OPTIONS_CHANGED, update);
	controller.sub(CarouselFlexEventType.CREATED, update);
	controller.sub(CarouselFlexEventType.DESTROYED, events.purge);

	return () => {};
};

export default DragHandler;
