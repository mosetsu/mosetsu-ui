export type CarouselFlexOptions = {
	breakpoints?: Record<string, string>;
	loop?: boolean;
	container: HTMLElement;
	selector: string;
};

export type SubscriptionProps = {
	[name: string]: Array<(instance?: CarouselFlexController) => void>;
};

export type CarouselTrackDetails = {
	abs: number;
	length: number;
	max: number;
	maxIdx: number;
	min: number;
	minIdx: number;
	position: number;
	rel: number;
	progress: number;
	slides: { abs: number; distance: number; portion: number; size: number }[];
	slidesLength: number;
};

export type CarouselTrackInstance = {
	refreshCarouselTrack: (idx?: number) => void;
	getDistanceToIdx: (distance: number) => number;
	getDistanceFromIndex: (idx: number, absolute: boolean, fromPosition?: number) => number;
	updatePosition: (value: number) => void;
	add: (value: number) => void;
	details: CarouselTrackDetails;
	velocity: () => number;
};

export type CarouselTransitionInstance = {
	start: (
		keyframes: {
			distance: number;
			duration: number;
			earlyExit?: number;
			easing: (t: number) => number;
		}[]
	) => void;
	stop: () => void;
};

export type CarouselFlexController = {
	options: CarouselFlexOptions;
	track: CarouselTrackInstance;
	transition: CarouselTransitionInstance;
	navigateToIndex: (index: number, absolute: boolean) => void;
	dispatch: (name: string) => void;
	sub: (name: string, callback: (controller?: CarouselFlexController) => void) => void;
};

export type KeyFrameOptions = {
	distance: number;
	duration: number;
	earlyExit?: number;
	easing: (t: number) => number;
};
