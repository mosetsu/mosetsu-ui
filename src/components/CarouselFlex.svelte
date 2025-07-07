<script lang="ts">
	import { onMount } from 'svelte';
	import DragHandler from '$lib/carouselFlexRuntime/enhancers/dragHandler';
	import SnapAlignment from '$lib/carouselFlexRuntime/enhancers/snapAlignment';
	import Positioner from '$lib/carouselFlexRuntime/enhancers/positioner';
	import Slider, { type CB } from '$lib/carouselFlexRuntime/controller';
	import Resizer from '$lib/carouselFlexRuntime/enhancers/resizer';

	import type { CarouselFlexClient, CarouselFlexOptions } from '$lib/carouselFlexRuntime/types';
	import KeyboardA11y from '$lib/carouselFlexRuntime/enhancers/keyboardA11y';

	export let options: Omit<CarouselFlexOptions, 'container'> = {
		breakpoints: {
			'(min-width: 400px)': {
				slides: { perView: 1, spacing: 0 }
			}
		},
		loop: false,
		selector: '.carousel__flex'
	};
	export let hooks: CB[];

	let container: HTMLDivElement | null = null;
	let controller: CarouselFlexClient;

	export function getController(): CarouselFlexClient | undefined {
		return controller;
	}

	export function handlePrevSlide() {
		if (controller) {
			controller.prevSlide();
		}
	}

	export function handleNextSlide() {
		if (controller) {
			controller.nextSlide();
		}
	}

	/**
	 * @summary
	 * This function allows you to programmatically navigate to a specific slide in the carousel.
	 * It can be used to jump to a slide based on user interaction or other logic.
	 */
	export function goToSlide(index: number) {
		if (controller) {
			controller.navigateToSlideIdx(index, false);
		}
	}

	onMount(() => {
		if (container) {
			controller = Slider(
				{ ...options, container },
				[Resizer, Positioner, DragHandler, SnapAlignment, KeyboardA11y],
				[
					...(Array.isArray(hooks) ? hooks : [])
					// [
					// 	'slideChanged',
					// 	(details) => {
					// 		// Update the active index or perform any other action when details change
					// 		onSlideChange(details?.track.details);
					// 	}
					// ],
					// [
					// 	'bpchange',
					// 	(e) => {
					// 		// Handle options change if needed
					// 		console.log('Options changed:', e?.config.currentBreakpoint);
					// 	}
					// ]
				]
			);
		}

		return () => {
			controller.destroy();
		};
	});
</script>

<div
	class="carousel-wrapper"
	bind:this={container}
	tabindex="0"
	role="row"
	aria-roledescription="carousel"
>
	<slot />
</div>

<style>
	.carousel-wrapper {
		width: 100%;
		display: flex;
		position: relative;
		align-content: flex-start;
		overflow: hidden;
		user-select: none;
		touch-action: pan-y;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
</style>
