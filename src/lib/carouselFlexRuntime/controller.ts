import CarouselTransition from './core/transition';
import CarouselTrack from './core/track';
import EventType from './events';
import type { CarouselFlexOptions, CarouselFlexController, SubscriptionProps } from './types';

const createBaseController = (options: CarouselFlexOptions): CarouselFlexController => {
	const subscriptions: SubscriptionProps = {};
	const controller = {
		options: {
			breakpoints: { slides: { perView: 1, spacing: 10 } },
			loop: false,
			isLayoutVertical: false,
			dragSpeed: 1,
			...options
		},
		config: {},
		sub: (name: string, callback: (instance?: CarouselFlexController) => void) => {
			if (!subscriptions[name]) subscriptions[name] = [];
			if (!subscriptions[name].includes(callback)) subscriptions[name].push(callback);
		},
		dispatch: (name: string) => {
			if (subscriptions[name]) {
				for (const cb of subscriptions[name]) cb(controller);
			}
		}
	} as CarouselFlexController;

	return controller;
};

const Controller = (
	options: CarouselFlexOptions,
	enhancers?: Array<(controller: CarouselFlexController) => void>
): CarouselFlexController => {
	const controller = createBaseController(options);

	console.log('Controller created with options:', options);

	controller.config.slideElements = Array.from(
		controller.options.container.querySelectorAll(controller.options.selector)
	);
	controller.track = CarouselTrack({
		isLoopEnabled: () => !!controller.options.loop,
		onDetailsChanged: () => controller.dispatch(EventType.DETAILS_CHANGED),
		onSlideChanged: () => controller.dispatch(EventType.SLIDE_CHANGED),
		getTrackConfig: () => controller.config.trackConfig || []
	});
	controller.transition = CarouselTransition({
		onAnimationStarted: () => controller.dispatch(EventType.ANIMATION_STARTED),
		onAnimationEnded: () => controller.dispatch(EventType.ANIMATION_ENDED),
		onAnimationStopped: () => controller.dispatch(EventType.ANIMATION_STOPPED),
		getCarouselTrack: () => controller.track
	});
	controller.navigateToIndex = (idx: number, absolute: boolean) => {
		const distance = controller.track.getDistanceFromIndex(idx, absolute);
		if (distance) {
			controller.transition.start([
				{ distance, duration: 500, easing: (t: number) => 1 - Math.pow(1 - t, 5) }
			]);
		}
	};
	// controller.prev = () => {
	// 	controller.navigateToIndex(controller.track.details.abs - 1, true);
	// };
	// controller.next = () => {
	// 	controller.navigateToIndex(controller.track.details.abs + 1, true);
	// };

	if (enhancers) {
		for (const enhancer of enhancers) {
			enhancer(controller);
		}
	}

	controller.track.refreshCarouselTrack(0);
	controller.dispatch(EventType.CREATED);

	return controller;
};

export default Controller;
