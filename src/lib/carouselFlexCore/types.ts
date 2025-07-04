export type CarouselFlexOptions = {
	breakpoints?: Record<string, string>;
	loop?: boolean;
	container: HTMLElement;
	selector?: string;
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
	absToRel: (absoluteIdx: number) => number;
	add: (value: number) => void;
	details: CarouselTrackDetails;
	distToIdx: (distance: number) => number;
	idxToDist: (idx: number, absolute?: boolean, fromPosition?: number) => number;
	init: (idx?: number) => void;
	to: (value: number) => void;
	velocity: () => number;
};

export type CarouselFlexController = {
	options: CarouselFlexOptions;
	track?: CarouselTrackInstance;
	animator?: any; // Placeholder for Animator type
	navigateToIndex: (index: number, absolute: boolean) => void;
	dispatch: (name: string) => void;
	sub: (name: string, callback: (controller?: CarouselFlexController) => void) => void;
};

export type CarouselSlideAnimationInstance = {
	active: boolean;
	start: (
		keyframes: {
			distance: number;
			duration: number;
			earlyExit?: number;
			easing: (t: number) => number;
		}[]
	) => void;
	stop: () => void;
	targetIdx: number | null;
};
