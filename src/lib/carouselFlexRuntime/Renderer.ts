import { getProp } from './utils';

export default function Renderer(slider): void {
	let autoScale = null;
	let elements;
	let verticalOption;

	function applyStylesInAnimationFrame(remove?, scale?, vertical?) {
		slider.transition.active
			? applyStyles(remove, scale, vertical)
			: requestAnimationFrame(() => applyStyles(remove, scale, vertical));
	}

	function applyStylesHook() {
		applyStylesInAnimationFrame(false, false, verticalOption);
	}

	function applyStyles(remove?, scale?, vertical?) {
		let sizeSum = 0;
		const size = slider.size;
		const details = slider.track.details;
		if (!details || !elements) return;
		const slides = details.slides;
		elements.forEach((element, idx) => {
			if (remove) {
				if (!autoScale && scale) scaleElement(element, null, vertical);
				positionElement(element, null, vertical);
			} else {
				if (!slides[idx]) return;
				const slideSize = slides[idx].size * size;
				if (!autoScale && scale) scaleElement(element, slideSize, vertical);
				positionElement(element, slides[idx].distance * size - sizeSum, vertical);
				sizeSum += slideSize;
			}
		});
	}

	function roundValue(value) {
		return Math.round(value);
	}

	function scaleElement(element, value, vertical) {
		const type = vertical ? 'height' : 'width';
		if (value !== null) {
			value = roundValue(value) + 'px';
		}
		element.style['min-' + type] = value;
		element.style['max-' + type] = value;
	}

	function positionElement(element, value, vertical) {
		if (value !== null) {
			value = roundValue(value);
			const x = vertical ? 0 : value;
			const y = vertical ? value : 0;
			value = `translate3d(${x}px, ${y}px, 0)`;
		}
		element.style.transform = value;
		element.style['-webkit-transform'] = value;
	}

	function reset() {
		if (elements) {
			applyStyles(true, true, verticalOption);
			elements = null;
		}
		slider.sub('detailsChanged', applyStylesHook, true);
	}

	function positionAndScale() {
		applyStylesInAnimationFrame(false, true, verticalOption);
	}

	function updateBefore() {
		reset();
	}

	function update() {
		reset();
		verticalOption = slider.options.vertical;
		autoScale = getProp(slider.options.slides, 'perView', null) === 'auto';
		slider.sub('detailsChanged', applyStylesHook);
		elements = slider.slides;
		if (!elements.length) return;
		positionAndScale();
	}

	slider.sub('created', update);
	slider.sub('optionsChanged', update);
	slider.sub('beforeOptionsChanged', updateBefore);
	slider.sub('updated', positionAndScale);
	slider.sub('destroyed', reset);
}
