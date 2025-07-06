<script lang="ts">
	import { onMount } from 'svelte';
	import DragHandler from '$lib/carouselFlexRuntime/enhancers/dragHandler';
	import SnapAlignment from '$lib/carouselFlexRuntime/enhancers/snapAlignment';
	import Positioner from '$lib/carouselFlexRuntime/enhancers/positioner';
	import Slider from '$lib/carouselFlexRuntime/controller';
	import Resizer from '$lib/carouselFlexRuntime/enhancers/resizer';

	import type { CarouselFlexClient } from '$lib/carouselFlexRuntime/types';

	export let options = {};
	export let onSlideChange: (details: any) => void = () => {};

	let container: HTMLDivElement | null = null;
	let controller: CarouselFlexClient;

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

	export function goToSlide(index: number) {
		if (controller) {
			controller.navigateToSlideIdx(index, false);
		}
	}

	onMount(() => {
		if (container) {
			// Initialize the slider
			controller = Slider({ ...options, container, selector: '.carousel__flex' }, [
				Resizer,
				Positioner,
				DragHandler,
				SnapAlignment
			]);

			controller.on('slideChanged', (details) => {
				// Update the active index or perform any other action when details change
				onSlideChange(details?.track.details);
			});
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
