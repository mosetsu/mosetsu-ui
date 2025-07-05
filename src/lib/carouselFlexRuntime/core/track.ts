import { clamp, roundToSixDecimalPlaces, getSign } from '../utils';
import type { CarouselTrackDetails, CarouselTrackInstance } from '../types';

type TrackOptions = {
	isLoopEnabled: () => boolean;
	onDetailsChanged: () => void;
	onSlideChanged: () => void;
	getTrackConfig: () => { size?: number; spacing?: number; origin?: number }[];
};

const CarouselTrack = (options: TrackOptions): CarouselTrackInstance => {
	const { isLoopEnabled, onDetailsChanged, onSlideChanged, getTrackConfig } = options;

	let details: CarouselTrackDetails | undefined;
	const infinity = Infinity;
	let measurePoints: { distance: number; timestamp: number }[] = [];
	let currentIdx: number | null = null;
	let totalSlidesLength: number;
	let trackLength: number;
	let slides: number[][];
	let slidesCount: number;
	let slidePositionOffsets: number[];
	let maxRelativeIdx: number = 0;
	let position = 0;
	let minIdx: number, maxIdx: number, loopMin: number, loopMax: number, min: number, max: number;

	const idxInRange = (idx: number): boolean => clampIdx(idx) === idx;

	const clampIdx = (idx: number): number => clamp(idx, minIdx, maxIdx);

	const measure = (distance: number): void => {
		measurePoints.push({
			distance,
			timestamp: Date.now()
		});
		if (measurePoints.length > 6) {
			measurePoints = measurePoints.slice(-6);
		}
	};

	const calculateCarouselBoundaries = (): void => {
		loopMin = minIdx = isLoopEnabled() ? -infinity : 0;
		loopMax = maxIdx = isLoopEnabled() ? infinity : maxRelativeIdx;
		const dragMin = null;
		const dragMax = null;
		if (dragMin !== null) {
			minIdx = dragMin;
		}
		if (dragMax !== null) {
			maxIdx = dragMax;
		}
		min = minIdx === -infinity ? minIdx : (getDistanceFromIndex(minIdx || 0, true, 0) ?? 0);
		max = maxIdx === infinity ? maxIdx : (getDistanceFromIndex(maxIdx, true, 0) ?? 0);
		if (dragMax === null) {
			loopMax = maxIdx;
		}
		min = roundToSixDecimalPlaces(min);
		max = roundToSixDecimalPlaces(max);
	};

	const getDistanceToIdx = (distance: number): number => {
		const { abs } = determineCarouselIndexes(position + distance);
		return idxInRange(abs) ? abs : 0;
	};

	const velocity = (): number => {
		const timestampNow = Date.now();
		const data = measurePoints.reduce(
			(acc, next) => {
				const { distance } = next;
				const { timestamp } = next;
				if (timestampNow - timestamp > 200) return acc;
				if (getSign(distance) !== getSign(acc.distance) && acc.distance) {
					acc = { distance: 0, lastTimestamp: 0, time: 0 };
				}
				if (acc.time) acc.distance += distance;
				if (acc.lastTimestamp) acc.time += timestamp - acc.lastTimestamp;
				acc.lastTimestamp = timestamp;
				return acc;
			},
			{ distance: 0, lastTimestamp: 0, time: 0 }
		);
		return data.distance / data.time || 0;
	};

	const getDistanceFromAbsoluteIndex = (idx: number, fromPosition?: number): number | null => {
		if (fromPosition == null) {
			fromPosition = roundToSixDecimalPlaces(position);
		}
		if (!idxInRange(idx) || idx === null) {
			return null;
		}
		idx = Math.round(idx);
		const { abs, rel, origin } = determineCarouselIndexes(fromPosition);
		const idxRelative = getRelativeIndex(idx);
		const positionRelative =
			((fromPosition % totalSlidesLength) + totalSlidesLength) % totalSlidesLength;
		const distanceToStart = slidePositionOffsets[origin];
		const distance = Math.floor((idx - (abs - rel)) / slidesCount) * totalSlidesLength;
		return roundToSixDecimalPlaces(
			distanceToStart -
				positionRelative -
				distanceToStart +
				slidePositionOffsets[idxRelative] +
				distance +
				(origin === slidesCount ? totalSlidesLength : 0)
		);
	};

	const getDistanceFromIndex = (
		idx: number,
		absolute: boolean,
		fromPosition?: number
	): number | null => {
		let distance: number = 0;

		if (absolute || !isLoopEnabled()) {
			return getDistanceFromAbsoluteIndex(idx, fromPosition);
		}
		if (!idxInRange(idx)) {
			return null;
		}

		const { abs, rel } = determineCarouselIndexes(fromPosition ?? position);
		const idxDistance = idx - rel;
		const nextIdx = abs + idxDistance;
		distance = getDistanceFromAbsoluteIndex(nextIdx) || 0;
		const otherDistance =
			getDistanceFromAbsoluteIndex(nextIdx - slidesCount * getSign(idxDistance)) || 0;

		if (
			(otherDistance !== null && Math.abs(otherDistance) < Math.abs(distance)) ||
			distance === null
		) {
			distance = otherDistance;
		}

		return roundToSixDecimalPlaces(distance);
	};

	const updatePosition = (value: number): void => {
		measure(value - position);
		position = roundToSixDecimalPlaces(value);
		const idx = refreshTrackData()?.abs || null;
		if (idx !== currentIdx) {
			currentIdx = idx;
			if (currentIdx === null) {
				onSlideChanged();
			}
		}
	};

	const add = (value: number): void => updatePosition(position + value);

	const getRelativeIndex = (idx: number): number =>
		((idx % slidesCount) + slidesCount) % slidesCount;

	const determineCarouselIndexes = (pos: number): { abs: number; origin: number; rel: number } => {
		let factor = Math.floor(Math.abs(roundToSixDecimalPlaces(pos / totalSlidesLength)));
		let positionRelative = roundToSixDecimalPlaces(
			((pos % totalSlidesLength) + totalSlidesLength) % totalSlidesLength
		);
		if (positionRelative === totalSlidesLength) {
			positionRelative = 0;
		}
		const positionSign = getSign(pos);
		const origin = slidePositionOffsets.indexOf(
			[...slidePositionOffsets].reduce((a, b) =>
				Math.abs(b - positionRelative) < Math.abs(a - positionRelative) ? b : a
			)
		);
		let idx = origin;
		if (positionSign < 0) factor++;
		if (origin === slidesCount) {
			idx = 0;
			factor += positionSign > 0 ? 1 : -1;
		}
		const abs = idx + factor * slidesCount * positionSign;

		return {
			abs,
			origin,
			rel: idx
		};
	};

	const getTrackDetails = (): CarouselTrackDetails | undefined => {
		if (!slidesCount) {
			return;
		}

		const loop = isLoopEnabled();
		const positionMod = loop ? position % totalSlidesLength : position;
		const positionRelative = loop
			? ((position % totalSlidesLength) + totalSlidesLength) % totalSlidesLength
			: position;

		const viewportPosition = positionMod - slides[0][2];
		const slidesStart =
			0 -
			(viewportPosition < 0 && loop
				? totalSlidesLength - Math.abs(viewportPosition)
				: viewportPosition);
		let sumLength = 0;

		let { abs, rel } = determineCarouselIndexes(position);
		const activeOrigin = slides[rel][2];
		const slideDetails = slides.map((slide, idx) => {
			let distanceViewport = slidesStart + sumLength;
			if (distanceViewport < 0 - slide[0] || distanceViewport > 1) {
				distanceViewport +=
					(Math.abs(distanceViewport) > totalSlidesLength - 1 && loop ? totalSlidesLength : 0) *
					getSign(-distanceViewport);
			}

			const idxDistance = idx - rel;
			const signIdxDistance = getSign(idxDistance);
			let absoluteIndex = idxDistance + abs;
			if (loop) {
				if (signIdxDistance === -1 && distanceViewport > activeOrigin) absoluteIndex += slidesCount;
				if (signIdxDistance === 1 && distanceViewport < activeOrigin) absoluteIndex -= slidesCount;
				if (loopMin !== null && absoluteIndex < loopMin) distanceViewport += totalSlidesLength;
				if (loopMax !== null && absoluteIndex > loopMax) distanceViewport -= totalSlidesLength;
			}

			const end = distanceViewport + slide[0] + slide[1];
			const viewPortPortion = Math.max(
				distanceViewport >= 0 && end <= 1
					? 1
					: end < 0 || distanceViewport > 1
						? 0
						: distanceViewport < 0
							? Math.min(1, (slide[0] + distanceViewport) / slide[0])
							: (1 - distanceViewport) / slide[0],
				0
			);
			sumLength += slide[0] + slide[1];

			return {
				abs: absoluteIndex,
				distance: distanceViewport,
				portion: viewPortPortion,
				size: slide[0]
			};
		});

		abs = clampIdx(abs);
		rel = getRelativeIndex(abs);

		return {
			abs: clampIdx(abs),
			length: trackLength,
			max,
			maxIdx,
			min,
			minIdx,
			position,
			progress: loop ? positionRelative / totalSlidesLength : position / trackLength,
			rel,
			slides: slideDetails,
			slidesLength: totalSlidesLength
		};
	};

	const refreshTrackData = (unset?: boolean) => {
		details = unset ? undefined : getTrackDetails();
		onDetailsChanged();
		return details;
	};

	const initializeCarouselSlides = (): void => {
		const trackConfig = getTrackConfig() || [];
		slides = trackConfig.map((entry: { size?: number; spacing?: number; origin?: number }) => [
			entry?.size ?? 1,
			entry?.spacing ?? 0,
			entry?.origin ?? 0
		]);
		slidesCount = slides.length;

		if (!slidesCount) {
			return;
		}

		totalSlidesLength = roundToSixDecimalPlaces(
			slides.reduce((acc: number, val: number[]) => acc + val[0] + val[1], 0)
		);

		const lastIdx = slidesCount - 1;
		trackLength = roundToSixDecimalPlaces(
			totalSlidesLength +
				slides[0][2] -
				slides[lastIdx][0] -
				slides[lastIdx][2] -
				slides[lastIdx][1]
		);
		let lastDistance: number;
		slidePositionOffsets = slides.reduce((acc: number[], val: number[]) => {
			if (!acc) {
				return [0];
			}
			const prev = slides[acc.length - 1];
			let distance = acc[acc.length - 1] + (prev[0] + prev[2]) + prev[1];

			distance -= val[2];
			if (acc[acc.length - 1] > distance) distance = acc[acc.length - 1];
			distance = roundToSixDecimalPlaces(distance);
			acc.push(distance);
			if (!lastDistance || lastDistance < distance) {
				maxRelativeIdx = acc.length - 1;
			}
			lastDistance = distance;
			return acc;
			// @ts-expect-error starting at null
		}, null);

		if (trackLength === 0) {
			maxRelativeIdx = 0;
		}

		slidePositionOffsets.push(roundToSixDecimalPlaces(totalSlidesLength));
	};

	const refreshCarouselTrack = (index?: number) => {
		initializeCarouselSlides();

		if (!slidesCount) {
			return refreshTrackData(true);
		}

		calculateCarouselBoundaries();

		if (index && Number.isInteger(index)) {
			add(getDistanceFromAbsoluteIndex(clampIdx(index)) || 0);
		} else {
			refreshTrackData();
		}
	};

	return {
		refreshCarouselTrack,
		add,
		getDistanceToIdx,
		getDistanceFromIndex,
		get details() {
			if (!details) {
				throw new Error('CarouselTrack details are not initialized.');
			}
			return details;
		},
		updatePosition,
		velocity
	};
};

export default CarouselTrack;
