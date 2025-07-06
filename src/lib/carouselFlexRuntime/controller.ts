import CarouselTransition from './core/transition';
import CarouselTrack from './core/track';
import { CarouselFlexEventType } from './events';
import type {
	CarouselFlexOptions,
	CarouselFlexController,
	SubscriptionProps,
	CarouselFlexClient
} from './types';

const createBaseController = (
	options: CarouselFlexOptions,
	subscriptions: SubscriptionProps
): CarouselFlexController => {
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
	enhancers?: Array<(controller: CarouselFlexController) => () => void>
): CarouselFlexClient => {
	const cleanUps: Array<() => void> = [];
	let subscriptions: SubscriptionProps = {};
	const controller = createBaseController(options, subscriptions);

	controller.config.slideElements = Array.from(
		controller.options.container.querySelectorAll(controller.options.selector)
	);
	controller.track = CarouselTrack({
		isLoopEnabled: () => !!controller.options.loop,
		onDetailsChanged: () => controller.dispatch(CarouselFlexEventType.DETAILS_CHANGED),
		onSlideChanged: () => controller.dispatch(CarouselFlexEventType.SLIDE_CHANGED),
		getTrackConfig: () => controller.config.trackConfig || []
	});
	controller.transition = CarouselTransition({
		onAnimationStarted: () => controller.dispatch(CarouselFlexEventType.ANIMATION_STARTED),
		onAnimationEnded: () => controller.dispatch(CarouselFlexEventType.ANIMATION_ENDED),
		onAnimationStopped: () => controller.dispatch(CarouselFlexEventType.ANIMATION_STOPPED),
		getCarouselTrack: () => controller.track
	});
	controller.navigateToSlideIdx = (idx: number, absolute: boolean) => {
		const distance = controller.track.getDistanceFromIndex(idx, absolute);
		if (distance) {
			controller.transition.start([
				{ distance, duration: 500, easing: (t: number) => 1 - Math.pow(1 - t, 5) }
			]);
		}
	};
	controller.prevSlide = (): void => {
		controller.navigateToSlideIdx(controller.track.details.abs - 1, true);
	};
	controller.nextSlide = () => {
		controller.navigateToSlideIdx(controller.track.details.abs + 1, true);
	};
	controller.destroy = () => {
		cleanUps.forEach((cleanup) => cleanup());
		subscriptions = {};
	};

	if (enhancers) {
		for (const enhancer of enhancers) {
			cleanUps.push(enhancer(controller));
		}
	}

	controller.track.refreshCarouselTrack(0);
	controller.dispatch(CarouselFlexEventType.CREATED);

	return {
		navigateToSlideIdx: controller.navigateToSlideIdx,
		prevSlide: controller.prevSlide,
		nextSlide: controller.nextSlide,
		on: controller.sub,
		destroy: controller.destroy
	};
};

export default Controller;
