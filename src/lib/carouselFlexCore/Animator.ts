import type { CarouselFlexController, CarouselSlideAnimationInstance } from './types';
import { cancelFrame, getFrame } from './utils';

const CarouselSlideAnimation = (
	controller: CarouselFlexController
): CarouselSlideAnimationInstance => {
	// eslint-disable-next-line prefer-const
	let instance: CarouselSlideAnimationInstance;
	let currentKeyframe: number;
	let duration: number;
	let keyframes: any[];
	let reqId: number;
	let started: number | null;

	function animate(now: number) {
		if (!started) started = now;
		setActive(true);
		let time = now - started;
		if (time > duration) time = duration;
		const keyframe = keyframes[currentKeyframe];
		const endTime = keyframe[3];
		if (endTime < time) {
			currentKeyframe++;
			return animate(now);
		}
		const startTime = keyframe[2];
		const easingDuration = keyframe[4];
		const startPosition = keyframe[0];
		const distance = keyframe[1];
		const easing = keyframe[5];
		const progress = easingDuration === 0 ? 1 : (time - startTime) / easingDuration;
		const add = distance * easing(progress);
		if (add) controller.track.to(startPosition + add);
		if (time < duration) return nextFrame();
		started = null;
		setActive(false);
		setTargetIdx(null);
		controller.dispatch('animationEnded');
	}

	function setActive(active: boolean) {
		instance.active = active;
	}

	function setTargetIdx(value: number | null) {
		instance.targetIdx = value;
	}

	function nextFrame() {
		reqId = getFrame(animate);
	}

	const stop = (): void => {
		cancelFrame(reqId);
		setActive(false);
		setTargetIdx(null);
		if (started) controller.dispatch('animationStopped');
		started = null;
	};

	const start = (_keyframes: any[]): void => {
		stop();
		if (!controller.track.details) {
			return;
		}
		let sumDistance = 0;
		let endPosition = controller.track.details.position;
		currentKeyframe = 0;
		duration = 0;
		keyframes = _keyframes.map((keyframe: any) => {
			const startPosition = Number(endPosition);
			const animationDuration = keyframe.earlyExit ?? keyframe.duration;
			const easing = keyframe.easing;
			const distance = keyframe.distance * easing(animationDuration / keyframe.duration) || 0;
			endPosition += distance;
			const startTime = duration;
			duration += animationDuration;
			sumDistance += distance;
			return [startPosition, keyframe.distance, startTime, duration, keyframe.duration, easing];
		});
		setTargetIdx(controller.track.distToIdx(sumDistance));
		nextFrame();
		controller.dispatch('animationStarted');
	};

	instance = { active: false, start, stop, targetIdx: null };
	return instance;
};

export default CarouselSlideAnimation;
