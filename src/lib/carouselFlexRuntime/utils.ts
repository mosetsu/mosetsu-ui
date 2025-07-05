/* eslint-disable @typescript-eslint/no-explicit-any */

const toArray = (nodeList: NodeList) => Array.prototype.slice.call(nodeList);

const getFloatOrInt = (float: number, int: number) => {
	const floatFloor = Math.floor(float);
	if (floatFloor === int || floatFloor + 1 === int) {
		return float;
	}

	return int;
};

export const clamp = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max);
};

export const getSign = (x: number): number => {
	return (x > 0 ? 1 : 0) - (x < 0 ? 1 : 0) || +x;
};

export const calculateBoundingRect = (elem: HTMLElement): { height: number; width: number } => {
	const boundingRect = elem.getBoundingClientRect();

	return {
		height: getFloatOrInt(boundingRect.height, elem.offsetHeight),
		width: getFloatOrInt(boundingRect.width, elem.offsetWidth)
	};
};

export const roundToSixDecimalPlaces = (value: number): number => Math.round(value * 1000000) / 1000000;

export const elems = (
	elements:
		| string
		| HTMLElement
		| HTMLElement[]
		| NodeList
		| HTMLCollection
		| null
		| ((
				wrapper: HTMLElement | Document
		  ) => string | HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null),
	wrapper: HTMLElement | Document
): HTMLElement[] => {
	wrapper = wrapper || document;
	if (typeof elements === 'function') elements = elements(wrapper);

	return Array.isArray(elements)
		? elements
		: typeof elements === 'string'
			? toArray(wrapper.querySelectorAll(elements))
			: elements instanceof HTMLElement
				? [elements]
				: elements instanceof NodeList
					? toArray(elements)
					: [];
};

export const prevent = (e: any): void => {
	if (e.raw) {
		e = e.raw;
	}
	if (e.cancelable && !e.defaultPrevented) {
		e.preventDefault();
	}
};

export const stop = (e: any): void => {
	if (e.raw) {
		e = e.raw;
	}
	if (e.stopPropagation) {
		e.stopPropagation();
	}
};

const inputHandler = (handler: any): any => {
	return (e: any) => {
		if (e.nativeEvent) {
			e = e.nativeEvent;
		}
		const changedTouches = e.changedTouches || [];
		const touchPoints = e.targetTouches || [];
		const detail = e.detail && e.detail.x ? e.detail : null;
		return handler({
			id: detail
				? detail.identifier
					? detail.identifier
					: 'i'
				: !touchPoints[0]
					? 'd'
					: touchPoints[0]
						? touchPoints[0].identifier
						: 'e',
			idChanged: detail
				? detail.identifier
					? detail.identifier
					: 'i'
				: !changedTouches[0]
					? 'd'
					: changedTouches[0]
						? changedTouches[0].identifier
						: 'e',
			raw: e,
			x:
				detail && detail.x
					? detail.x
					: touchPoints[0]
						? touchPoints[0].screenX
						: detail
							? detail.x
							: e.pageX,
			y:
				detail && detail.y
					? detail.y
					: touchPoints[0]
						? touchPoints[0].screenY
						: detail
							? detail.y
							: e.pageY
		});
	};
};

export const Events = (): {
	add: (
		element: Element | Document | Window | MediaQueryList,
		event: string,
		handler: (event: Event) => void,
		options?: AddEventListenerOptions
	) => void;
	input: (
		element: Element | Document | Window | MediaQueryList,
		event: string,
		handler: (event: Event) => void,
		options?: AddEventListenerOptions
	) => void;
	purge: () => void;
} => {
	let events: any[] = [];

	return {
		add(element, event, handler, options) {
			if ((element as MediaQueryList).addListener) {
				(element as MediaQueryList).addListener(handler);
			} else {
				element.addEventListener(event, handler, options);
			}
			events.push([element, event, handler, options]);
		},
		input(element, event, handler, options) {
			this.add(element, event, inputHandler(handler), options);
		},
		purge() {
			events.forEach((event) => {
				if (event[0].removeListener) {
					event[0].removeListener(event[2]);
				} else {
					event[0].removeEventListener(event[1], event[2], event[3]);
				}
			});
			events = [];
		}
	};
};
