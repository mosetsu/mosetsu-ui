import { CarouselFlexEventType } from '../events';
import type { CarouselFlexController } from '../types';

enum KeyCode {
	ARROW_LEFT = 'ArrowLeft',
	ARROW_RIGHT = 'ArrowRight'
}

const KeyboardA11y = (controller: CarouselFlexController): (() => void) => {
	const container: HTMLElement = controller.options.container;
	const keyActions: Record<string, () => void> = {
		[KeyCode.ARROW_LEFT]: () => controller.prevSlide(),
		[KeyCode.ARROW_RIGHT]: () => controller.nextSlide()
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key in keyActions) {
			event.preventDefault();
			keyActions[event.key]();
		}
	};

	const initEvents = () => {
		container.addEventListener('keydown', handleKeyDown);
	};

	const destroy = () => {
		container.removeEventListener('keydown', handleKeyDown);
	};

	controller.sub(CarouselFlexEventType.CREATED, initEvents);
	controller.sub(CarouselFlexEventType.DESTROYED, destroy);

	return destroy;
};

export default KeyboardA11y;
