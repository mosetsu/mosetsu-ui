import { cancelFrame, getFrame } from '../utils';
import type { CarouselTrackInstance, CarouselTransitionInstance, KeyFrameOptions } from '../types';

type TransitionOptions = {
	onAnimationStarted: () => void;
	onAnimationEnded: () => void;
	onAnimationStopped: () => void;
	getCarouselTrack: () => CarouselTrackInstance;
};

const CarouselTransition = (options: TransitionOptions): CarouselTransitionInstance => {
	const { onAnimationStarted, onAnimationEnded, onAnimationStopped, getCarouselTrack } = options;

	let currentKeyframe: number;
	let duration: number;
	let keyframes: Array<[number, number, number, number, number, (t: number) => number]> = [];
	let reqId: number;
	let started: number | null;

	const runKeyframeAnimation = (now: number) => {
		if (!started) {
			started = now;
		}
		let time = now - started;

		if (time > duration) {
			time = duration;
		}

		const keyframe = keyframes[currentKeyframe];
		const endTime = keyframe[3];

		if (endTime < time) {
			currentKeyframe++;
			return runKeyframeAnimation(now);
		}

		const startTime = keyframe[2];
		const easingDuration = keyframe[4];
		const startPosition = keyframe[0];
		const distance = keyframe[1];
		const easing = keyframe[5];
		const progress = easingDuration === 0 ? 1 : (time - startTime) / easingDuration;
		const add = distance * easing(progress);

		if (add) {
			getCarouselTrack().updatePosition(startPosition + add);
		}
		if (time < duration) {
			return nextFrame();
		}

		started = null;
		onAnimationEnded();
	};

	function nextFrame() {
		reqId = getFrame(runKeyframeAnimation);
	}

	const stopTransition = (): void => {
		cancelFrame(reqId);
		if (started) {
			onAnimationStopped();
		}
		started = null;
	};

	const beginTransition = (kFrames: KeyFrameOptions[]): void => {
		stopTransition();
		if (!getCarouselTrack().details) {
			return;
		}
		let endPosition = getCarouselTrack().details.position;
		currentKeyframe = 0;
		duration = 0;
		keyframes = kFrames.map((keyframe: KeyFrameOptions) => {
			const startPosition = Number(endPosition);
			const animationDuration = keyframe.earlyExit ?? keyframe.duration;
			const easing = keyframe.easing;
			const distance = keyframe.distance * easing(animationDuration / keyframe.duration) || 0;
			endPosition += distance;
			const startTime = duration;
			duration += animationDuration;
			return [startPosition, keyframe.distance, startTime, duration, keyframe.duration, easing];
		});
		nextFrame();
		onAnimationStarted();
	};

	return {
		start: beginTransition,
		stop: stopTransition
	};
};

export default CarouselTransition;
