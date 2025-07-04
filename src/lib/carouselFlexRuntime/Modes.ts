import { clamp, sign } from './utils';

export default function Free(slider): void {
	let startIdx, moveIdx;
	let checked;
	let currentDirection;
	let min;
	let max;
	let minIdx;
	let maxIdx;

	function adjustDuration(duration) {
		return duration * 2;
	}

	function clampIdx(idx) {
		return clamp(idx, minIdx, maxIdx);
	}

	function t(x) {
		return 1 - Math.pow(-x + 1, 1 / 3);
	}

	function x(t) {
		return 1 - Math.pow(1 - t, 3);
	}

	function velocity() {
		return checked ? slider.track.velocity() : 0;
	}

	function free() {
		stop();
		const isFreeSnap = true;
		const track = slider.track;
		const speed = velocity();
		currentDirection = sign(speed);
		const trackDetails = slider.track.details;
		const keyframes = [];
		if (!speed && isFreeSnap) {
			slider.navigateToIndex(clampIdx(trackDetails.abs), true, {
				duration: 500,
				easing: (t) => 1 + --t * t * t * t * t
			});
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
			if (sign(newDistance) === currentDirection) {
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

		slider.transition.start(keyframes);
	}

	function speedToDistanceAndDuration(s, m = 1000) {
		s = Math.abs(s);
		const decelerationRate = 0.000000147 + s / m;
		return {
			dist: Math.pow(s, 2) / decelerationRate,
			dur: s / decelerationRate
		};
	}

	function update() {
		const details = slider.track.details;
		if (!details) return;
		min = details.min;
		max = details.max;
		minIdx = details.minIdx;
		maxIdx = details.maxIdx;
	}

	function start() {
		checked = false;
		stop();
		startIdx = moveIdx = slider.track.details.abs;
	}

	function stop() {
		slider.transition.stop();
	}

	function check() {
		checked = true;
	}

	function drag() {
		moveIdx = slider.track.details.abs;
	}

	slider.sub('updated', update);
	slider.sub('optionsChanged', update);
	slider.sub('created', update);
	slider.sub('dragStarted', start);
	slider.sub('dragChecked', check);
	slider.sub('dragEnded', free);
	slider.sub('dragged', drag);
}
