import { elems, Events, prevent, sign, stop } from './utils';

export default function Drag(slider): void {
	const events = Events();
	const breakFactorValue = 2;
	let container;
	let direction;
	const defaultDirection = 1;
	let size;
	let windowSize;
	let dragActive;
	let dragSpeed;
	let dragIdentifier;
	let dragJustStarted;
	let lastValue;
	let sumDistance;
	let isProperDrag;
	let lastX;
	let lastY;
	let scrollTouchActive;
	let scrollLock;
	let min;
	let max;

	function drag(e) {
		if (!dragActive || dragIdentifier !== e.id) {
			return;
		}
		const value = xy(e);

		if (dragJustStarted) {
			if (!isSlide(e)) return dragStop(e);
			lastValue = value;
			dragJustStarted = false;
			slider.dispatch('dragChecked');
		}

		if (scrollLock) return (lastValue = value);
		prevent(e);
		const distance = rubberband((dragSpeed(lastValue - value) / size) * defaultDirection);
		direction = sign(distance);
		const position = slider.track.details.position;

		if (
			(position > min && position < max) ||
			(position === min && direction > 0) ||
			(position === max && direction < 0)
		)
			stop(e);
		sumDistance += distance;
		if (!isProperDrag && Math.abs(sumDistance * size) > 5) {
			isProperDrag = true;
		}
		slider.track.add(distance);
		lastValue = value;
		slider.dispatch('dragged');
	}

	function dragStart(e) {
		if (dragActive || !slider.track.details || !slider.track.details.length) return;
		sumDistance = 0;
		dragActive = true;
		isProperDrag = false;
		dragJustStarted = true;
		dragIdentifier = e.id;
		isSlide(e);
		lastValue = xy(e);
		slider.dispatch('dragStarted');
	}

	function dragStop(e) {
		if (!dragActive || dragIdentifier !== e.idChanged) return;
		dragActive = false;
		slider.dispatch('dragEnded');
	}

	function isSlide(e) {
		const vertical = isVertical();
		const x = vertical ? e.y : e.x;
		const y = vertical ? e.x : e.y;
		const isSlide =
			lastX !== undefined && lastY !== undefined && Math.abs(lastY - y) <= Math.abs(lastX - x);
		lastX = x;
		lastY = y;
		return isSlide;
	}

	function xy(e) {
		return isVertical() ? e.y : e.x;
	}

	function preventScrolling(element) {
		let start;
		events.input(
			element,
			'touchstart',
			(e: TouchEvent) => {
				start = xy(e);
				scrollLock = true;
				scrollTouchActive = true;
			},
			{ passive: true }
		);
		events.input(element, 'touchmove', (e: TouchEvent) => {
			const vertical = isVertical();
			const maxPosition = vertical
				? element.scrollHeight - element.clientHeight
				: element.scrollWidth - element.clientWidth;
			const direction = start - xy(e);
			const position = vertical ? element.scrollTop : element.scrollLeft;
			const scrollingEnabled =
				(vertical && element.style.overflowY === 'scroll') ||
				(!vertical && element.style.overflowX === 'scroll');

			start = xy(e);
			if (
				((direction < 0 && position > 0) || (direction > 0 && position < maxPosition)) &&
				scrollTouchActive &&
				scrollingEnabled
			)
				return (scrollLock = true);

			scrollTouchActive = false;
			prevent(e);
			scrollLock = false;
		});

		events.input(element, 'touchend', () => {
			scrollLock = false;
		});
	}

	function rubberband(distance) {
		if (min === -Infinity && max === Infinity) return distance;
		const details = slider.track.details;
		const length = details.length;
		const position = details.position;
		if (length === 0) return 0;

		if (position <= max && position >= min) return distance;
		if ((position < min && direction > 0) || (position > max && direction < 0)) {
			return distance;
		}
		const overflow = (position < min ? position - min : position - max) / length;
		const trackSize = size * length;
		const overflowedSize = Math.abs(overflow * trackSize);
		const p = Math.max(0, 1 - (overflowedSize / windowSize) * breakFactorValue);
		return p * p * distance;
	}

	function setSpeed() {
		const speed = slider.options.dragSpeed || 1;
		dragSpeed = typeof speed === 'function' ? speed : (val) => val * (speed as number);
	}

	function isVertical() {
		return slider.options.vertical;
	}

	function preventClicks() {
		const attr = `data-carousel-clickable`;
		elems(`[${attr}]:not([${attr}=false])`, container).map((clickable) => {
			events.add(clickable, 'dragstart', stop);
			events.add(clickable, 'mousedown', stop);
			events.add(clickable, 'touchstart', stop);
		});
	}

	function setSizes() {
		size = slider.size;
		windowSize = isVertical() ? window.innerHeight : window.innerWidth;
		const details = slider.track.details;
		if (!details) return;
		min = details.min;
		max = details.max;
	}

	function preventClick(e) {
		if (isProperDrag) {
			stop(e);
			prevent(e);
		}
	}

	function update() {
		events.purge();
		setSpeed();
		setSizes();
		container = slider.container;
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
			if (dragActive) prevent(e);
		});
		const attr = 'data-carousel-scrollable';
		elems(`[${attr}]:not([${attr}=false])`, slider.container).map((element) =>
			preventScrolling(element)
		);
	}

	slider.sub('updated', setSizes);
	slider.sub('optionsChanged', update);
	slider.sub('created', update);
	slider.sub('destroyed', events.purge);
}
