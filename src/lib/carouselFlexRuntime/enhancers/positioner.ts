import { CarouselFlexEventType } from '../events';
import type { CarouselFlexController } from '../types';

const Positioner = (controller: CarouselFlexController): (() => void) => {
	const autoScale = false;
	let elements: HTMLElement[] = [];
	let verticalOption: boolean;

	const roundValue = (value: number): number => {
		return Math.round(value);
	};

	const positionElement = (
		element: HTMLElement,
		value: number | string | null,
		vertical: boolean
	) => {
		let transformValue: string;

		if (value !== null) {
			const rounded = roundValue(+value);
			const x = vertical ? 0 : rounded;
			const y = vertical ? rounded : 0;
			transformValue = `translate3d(${x}px, ${y}px, 0)`;
		} else {
			transformValue = 'unset';
		}

		element.style.setProperty('transform', transformValue);
		element.style.setProperty('-webkit-transform', transformValue);
	};

	const scaleElement = (element: HTMLElement, value: number | null, vertical: boolean) => {
		const type = vertical ? 'height' : 'width';
		let transformValue: string;

		if (value !== null) {
			transformValue = roundValue(value) + 'px';
		} else {
			transformValue = 'unset';
		}

		element.style.setProperty('min-' + type, transformValue);
		element.style.setProperty('max-' + type, transformValue);
	};

	const applyStyles = (remove: boolean, scale: boolean, vertical: boolean) => {
		let sizeSum = 0;
		const size = controller.config.containerSize;
		const details = controller.track.details;
		if (!details || !elements.length) {
			return;
		}
		const slides = details.slides;
		elements.forEach((element, idx) => {
			if (remove) {
				if (!autoScale && scale) {
					scaleElement(element, null, vertical);
				}
				positionElement(element, null, vertical);
			} else {
				if (!slides[idx]) {
					return;
				}
				const slideSize = slides[idx].size * size;
				if (!autoScale && scale) {
					scaleElement(element, slideSize, vertical);
				}
				positionElement(element, slides[idx].distance * size - sizeSum, vertical);
				sizeSum += slideSize;
			}
		});
	};

	const reset = () => {
		if (elements.length) {
			applyStyles(true, true, verticalOption);
			elements = [];
		}
		controller.sub(CarouselFlexEventType.DETAILS_CHANGED, applyStylesHook);
	};

	const applyStylesInAnimationFrame = (remove: boolean, scale: boolean, vertical: boolean) => {
		requestAnimationFrame(() => applyStyles(remove, scale, vertical));
	};

	const applyStylesHook = () => {
		applyStylesInAnimationFrame(false, false, verticalOption);
	};

	const positionAndScale = () => {
		applyStylesInAnimationFrame(false, true, verticalOption);
	};

	const update = () => {
		reset();
		verticalOption = controller.options.isLayoutVertical || false;
		controller.sub(CarouselFlexEventType.DETAILS_CHANGED, applyStylesHook);
		elements = controller.config.slideElements || [];
		if (!elements.length) {
			return;
		}
		positionAndScale();
	};

	controller.sub(CarouselFlexEventType.CREATED, update);
	controller.sub(CarouselFlexEventType.OPTIONS_CHANGED, update);
	controller.sub(CarouselFlexEventType.BEFORE_OPTIONS_CHANGED, reset);
	controller.sub(CarouselFlexEventType.UPDATED, positionAndScale);
	controller.sub(CarouselFlexEventType.DESTROYED, reset);

	return () => {};
};

export default Positioner;
