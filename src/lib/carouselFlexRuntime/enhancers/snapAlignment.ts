import { clamp, getSign } from '../utils';
import type { CarouselFlexController, KeyFrameOptions } from '../types';

const SnapAlignment = (controller: CarouselFlexController): (() => void) => {
	let checked: boolean;
	let currentDirection: number;
	let min: number;
	let max: number;
	let minIdx: number;
	let maxIdx: number;

	const adjustDuration = (duration: number) => duration * 2;

	const clampIdx = (idx: number) => clamp(idx, minIdx, maxIdx);

	const t = (x: number) => 1 - Math.pow(-x + 1, 1 / 3);

	const x = (t: number) => 1 - Math.pow(1 - t, 3);

	const velocity = () => (checked ? controller.track.velocity() : 0);

	const start = (): void => {
		checked = false;
		stop();
	};

	const stop = (): void => {
		controller.transition.stop();
	};

	const check = (): void => {
		checked = true;
	};

	const speedToDistanceAndDuration = (s: number, m = 1000) => {
		s = Math.abs(s);
		const decelerationRate = 0.000000147 + s / m;
		return {
			dist: Math.pow(s, 2) / decelerationRate,
			dur: s / decelerationRate
		};
	};

	const update = (): void => {
		const details = controller.track.details;

		if (!details) {
			return;
		}

		min = details.min;
		max = details.max;
		minIdx = details.minIdx;
		maxIdx = details.maxIdx;
	};

	const free = (): void => {
		stop();
		const isFreeSnap = true;
		const track = controller.track;
		const speed = velocity();
		currentDirection = getSign(speed);
		const trackDetails = controller.track.details;

		const keyframes: KeyFrameOptions[] = [];
		if (!speed && isFreeSnap) {
			controller.navigateToSlideIdx(clampIdx(trackDetails.abs), true);
			// {
			// 	duration: 500,
			// 	easing: (t) => 1 + --t * t * t * t * t
			// }
			return;
		}
		let { dist, dur } = speedToDistanceAndDuration(speed);
		dur = adjustDuration(dur);
		dist *= currentDirection;
		if (isFreeSnap) {
			const snapDist = track.getDistanceFromIndex(track.getDistanceToIdx(dist), true);
			if (snapDist) dist = snapDist;
		}

		keyframes.push({
			distance: dist,
			duration: dur,
			easing: x
		});
		const position = trackDetails.position;
		const newPosition = position + dist;
		if (newPosition < min || newPosition > max) {
			const newDistance = newPosition < min ? min - position : max - position;
			let addToBounceBack = 0;
			let bounceSpeed = speed;
			if (getSign(newDistance) === currentDirection) {
				const distancePortion = Math.min(Math.abs(newDistance) / Math.abs(dist), 1);
				const durationPortion = t(distancePortion) * dur;
				keyframes[0].earlyExit = durationPortion;
				bounceSpeed = speed * (1 - distancePortion);
			} else {
				keyframes[0].earlyExit = 0;
				addToBounceBack += newDistance;
			}

			const bounce = speedToDistanceAndDuration(bounceSpeed, 100);
			const bounceDist = bounce.dist * currentDirection;

			keyframes.push({
				distance: bounceDist,
				duration: adjustDuration(bounce.dur),
				easing: x
			});
			keyframes.push({
				distance: -bounceDist + addToBounceBack,
				duration: 500,
				easing: x
			});
		}

		controller.transition.start(keyframes);
	};

	controller.sub('updated', update);
	controller.sub('optionsChanged', update);
	controller.sub('created', update);
	controller.sub('dragStarted', start);
	controller.sub('dragChecked', check);
	controller.sub('dragEnded', free);

	return () => {};
};

export default SnapAlignment;
