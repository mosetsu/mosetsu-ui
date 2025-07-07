import { Events, calculateBoundingRect } from '../utils';
import { CarouselFlexEventType, DOMEventType } from '../events';
import type { CarouselFlexController } from '../types';

const Resizer = (controller: CarouselFlexController): (() => void) => {
	const events = Events();

	let mediaQueryLists: Array<MediaQueryList & { __media?: string }> = [];
	let compareSize: number;
	let currentMatch: boolean | null;
	let currentBreakpoint: { perView: number; spacing: number };

	const renewTrackConfig = (): void => {
		const elemsCount = controller.config.slideElements.length;
		const config = [];
		const perView = currentBreakpoint.perView || 1;
		const spacing = currentBreakpoint.spacing / controller.config.containerSize || 0;
		const spacingPortion = spacing / perView;
		const originOption = 'auto';
		let length = 0;
		for (let i = 0; i < elemsCount; i++) {
			const size = 1 / perView - spacing + spacingPortion;
			config.push({
				origin: 0,
				size,
				spacing
			});
			length += size;
		}
		length += spacing * (elemsCount - 1);
		if (originOption === 'auto' && !controller.options.loop && perView !== 1) {
			let checkedLength = 0;
			config.map((entry) => {
				const space = length - checkedLength;
				checkedLength += entry.size + spacing;
				if (space >= 1) return entry;
				entry.origin = 1 - space - (length > 1 ? 0 : 1 - length);
				return entry;
			});
		}

		controller.config.trackConfig = config;
	};

	const updateContainerSize = (): void => {
		const size = calculateBoundingRect(controller.options.container);
		controller.config.containerSize =
			(controller.options.isLayoutVertical ? size.height : size.width) || 1;
	};

	const hasBreakpointChanged = (): boolean => {
		let match = null;
		mediaQueryLists.forEach((mediaQueryList) => {
			if (mediaQueryList.matches) {
				match = mediaQueryList.__media;
			}
		});

		if (match === currentMatch) {
			return false;
		}
		if (!currentMatch) {
			controller.dispatch(CarouselFlexEventType.BEFORE_OPTIONS_CHANGED);
		}

		currentMatch = match;
		currentBreakpoint = (match && controller.options.breakpoints?.[match]?.slides) || {
			perView: 1,
			spacing: 10
		};
		controller.config.currentBreakpoint = currentBreakpoint;
		// console.log('Current breakpoint:', currentBreakpoint);
		controller.dispatch('bpchange');

		updateContainerSize();
		renewTrackConfig();

		return true;
	};

	const getSlidesConfigLength = (): number => {
		return controller.config.trackConfig.length;
	};

	const handleWindowResize = (): void => {
		updateContainerSize();
		const newSize = controller.config.containerSize;
		if (newSize === compareSize) {
			return;
		}
		compareSize = newSize;

		updateContainerSize();
		const slidesCount = getSlidesConfigLength();
		renewTrackConfig();

		if (getSlidesConfigLength() !== slidesCount) {
			optionsChanged();
		} else {
			refreshTrack();
		}

		controller.dispatch(CarouselFlexEventType.UPDATED);
	};

	const handleOrientationChange = () => setTimeout(handleWindowResize, 500);

	const refreshTrack = (idx?: number) => {
		controller.transition.stop();
		const details = controller.track.details;

		controller.track.refreshCarouselTrack(idx ?? (details ? details.abs : 0));
	};

	const optionsChanged = (idx?: number) => {
		refreshTrack(idx);
		controller.dispatch(CarouselFlexEventType.OPTIONS_CHANGED);
	};

	const handleBreakpointChange = (): void => {
		if (!hasBreakpointChanged()) {
			return;
		}
		optionsChanged();
	};

	(() => {
		currentMatch = false;
		events.purge();
		compareSize = controller.config.containerSize;
		mediaQueryLists = [];
		for (const value in controller.options.breakpoints || {}) {
			const mediaQueryList: MediaQueryList & { __media?: string } = window.matchMedia(value);
			mediaQueryList.__media = value;
			mediaQueryLists.push(mediaQueryList);
			events.add(mediaQueryList, DOMEventType.BREAKPOINT_CHANGE, handleBreakpointChange);
		}
		events.add(window, DOMEventType.ORIENTATION_CHANGE, handleOrientationChange);
		events.add(window, DOMEventType.RESIZE, handleWindowResize);
		hasBreakpointChanged();
	})();

	return (): void => {
		events.purge();
		controller.dispatch(CarouselFlexEventType.DESTROYED);
	};
};

export default Resizer;
