import { elems, Events, prevent, sign, stop } from '../utils';
import EventType from '../events';
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

	const getMovementAxis = (e): number => (isVertical() ? e.y : e.x);

	const isValidSlideDirection = (e): boolean => {
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

	const preventClick = (e): void => {
		if (isProperDrag) {
			stop(e);
			prevent(e);
		}
	};

	const preventClicks = (): void => {
		const attr = `data-carousel-clickable`;
		elems(`[${attr}]:not([${attr}=false])`, container).map((clickable) => {
			events.add(clickable, 'dragstart', stop);
			events.add(clickable, 'mousedown', stop);
			events.add(clickable, 'touchstart', stop);
		});
	};

	const preventScrolling = (element: HTMLElement): void => {
		let start: number;
		events.input(
			element,
			'touchstart',
			(e) => {
				console.log('touchstart', e);
				start = getMovementAxis(e);
				scrollLock = true;
				isScrollTouchEnabled = true;
			},
			{ passive: true }
		);
		events.input(element, 'touchmove', (e) => {
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

		events.input(element, 'touchend', () => {
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

	const dragStart = (e): void => {
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
		controller.dispatch(EventType.DRAG_STARTED);
	};

	const dragStop = (e): void => {
		if (!dragActive || dragIdentifier !== e.idChanged) {
			return;
		}
		dragActive = false;
		controller.dispatch(EventType.DRAG_ENDED);
	};

	const drag = (e): void => {
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
			controller.dispatch(EventType.DRAG_CHECKED);
		}

		if (scrollLock) {
			lastValue = value;
			return;
		}
		prevent(e);
		const distance = applyRubberbandEffect(
			(dragSpeed(lastValue - value) / containerSize) * defaultDirection
		);
		direction = sign(distance);
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
		controller.dispatch(EventType.DRAGGED);
	};

	const update = (): void => {
		events.purge();
		setSpeed();
		setSizes();
		container = controller.options.container;
		preventClicks();
		events.add(container, 'dragstart', (e) => {
			prevent(e);
		});
		events.add(container, 'click', preventClick, { capture: true });
		events.input(container, 'ksDragStart', dragStart);
		events.input(container, 'ksDrag', drag);
		events.input(container, 'ksDragEnd', dragStop);
		events.input(container, 'mousedown', dragStart);
		events.input(container, 'mousemove', drag);
		events.input(container, 'mouseleave', dragStop);
		events.input(container, 'mouseup', dragStop);
		events.input(container, 'touchstart', dragStart, { passive: true });
		events.input(container, 'touchmove', drag, { passive: false });
		events.input(container, 'touchend', dragStop);
		events.input(container, 'touchcancel', dragStop);
		events.add(window, 'wheel', (e) => {
			if (dragActive) {
				prevent(e);
			}
		});
		const attr = 'data-carousel-scrollable';
		elems(`[${attr}]:not([${attr}=false])`, controller.options.container).map((element) =>
			preventScrolling(element)
		);
	};

	controller.sub(EventType.UPDATED, setSizes);
	controller.sub(EventType.OPTIONS_CHANGED, update);
	controller.sub(EventType.CREATED, update);
	controller.sub(EventType.DESTROYED, events.purge);

	return () => {};
};

export default DragHandler;
