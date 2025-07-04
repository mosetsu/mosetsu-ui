import CarouselSlideAnimation from './Animator';
import CarouselTrack from './carouselTrack';
import type { CarouselFlexOptions, CarouselFlexController, SubscriptionProps } from './types';

const Controller = (
	options: CarouselFlexOptions,
	enhancers?: Array<(controller: CarouselFlexController) => void>
): CarouselFlexController => {
	const subscriptions: SubscriptionProps = {};
	const controller: CarouselFlexController = {
		options,
		navigateToIndex: (idx: number, absolute: boolean) => {
			const distance = controller?.track?.idxToDist(idx, absolute);
			if (!distance) {
				return;
			}
			controller.animator.start([
				{
					distance,
					duration: 500,
					easing: (t: number): number => 1 - Math.pow(1 - t, 5)
				}
			]);
		},
		sub: (name: string, callback: (instance?: CarouselFlexController) => void) => {
			if (!subscriptions[name]) {
				subscriptions[name] = [];
			}

			if (subscriptions[name].indexOf(callback) === -1) {
				subscriptions[name].push(callback);
			}
		},
		dispatch: (name: string) => {
			if (subscriptions[name]) {
				subscriptions[name].forEach((callback) => {
					callback(controller);
				});
			}
		}
	};

	(() => {
		controller.track = CarouselTrack(controller);
		controller.animator = CarouselSlideAnimation(controller);
		if (enhancers) {
			for (const enhancer of enhancers) {
				enhancer(controller);
			}
		}
		controller.track.init(0);
		controller.dispatch('created');
	})();

	return controller;
};

export default Controller;
