<!-- 
  Carousel.svelte 
  A minimal, dependency-free Svelte carousel inspired by Keen Slider's architecture.
  This version accepts slides directly via the default slot and uses Svelte's on: directive for events.
-->
<script lang="ts">
	import DragHandler from '$lib/carouselFlexRuntime/enhancers/dragHandler';
	import SnapAlignment from '$lib/carouselFlexRuntime/enhancers/snapAlignment';
	import Positioner from '$lib/carouselFlexRuntime/enhancers/positioner';
	import Slider from '$lib/carouselFlexRuntime/controller';
	import Resizer from '$lib/carouselFlexRuntime/enhancers/resizer';
	import { onMount } from 'svelte';

	export let options = {};
	let container: HTMLDivElement | null = null;

	onMount(() => {
		if (container) {
			// Initialize the slider
			Slider({ ...options, container, selector: '.carousel__flex' }, [
				Resizer,
				Positioner,
				DragHandler,
				SnapAlignment
			]);
		}

		return () => {};
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
		-webkit-tap-highlight-color: transparent;
		align-content: flex-start;
		display: flex;
		overflow: hidden;
		position: relative;
		touch-action: pan-y;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-khtml-user-select: none;
		width: 100%;
	}
</style>
