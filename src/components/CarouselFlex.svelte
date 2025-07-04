<!-- 
  Carousel.svelte 
  A minimal, dependency-free Svelte carousel inspired by Keen Slider's architecture.
  This version accepts slides directly via the default slot and uses Svelte's on: directive for events.
-->
<script lang="ts">
	import Drag from '$lib/carouselFlexRuntime/Drag';
	import Free from '$lib/carouselFlexRuntime/Modes';
	import Renderer from '$lib/carouselFlexRuntime/Renderer';
	import Slider from '$lib/carouselFlexRuntime/controller';
	import Web from '$lib/carouselFlexRuntime/web';
	import { onMount } from 'svelte';

	export let options = {};
	let container: HTMLDivElement | null = null;

	// --- EVENT HANDLERS ---

	function onDragStart() {}

	function onDragMove() {}

	function onDragEnd() {}

	function onKeyDown() {}

	// --- LIFECYCLE & SETUP ---

	onMount(() => {
		if (container) {
			console.log('Initializing carousel with options:', options);

			const defOpts = {
				// drag: true,
				selector: '.carousel__flex'
			};
			// Initialize the slider
			Slider({ ...options, container, selector: '.carousel__flex' }, [
				Web(container, defOpts),
				Renderer,
				Drag,
				Free
			]);
		}

		return () => {};
	});
</script>

<!-- Listen for window-level events to handle dragging outside the component -->
<svelte:window
	on:mousemove={onDragMove}
	on:touchmove|preventDefault={onDragMove}
	on:mouseup={onDragEnd}
	on:touchend={onDragEnd}
/>

<div
	class="carousel-wrapper"
	bind:this={container}
	on:keydown={onKeyDown}
	on:mousedown={onDragStart}
	on:touchstart|passive={onDragStart}
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
