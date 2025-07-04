<script lang="ts">
	import Carousel from '../../components/CarouselFlex.svelte';

	// Configuration for the carousel
	const items = [
		{ id: 1, bg: 'bg-red-300' },
		{ id: 2, bg: 'bg-blue-300' },
		{ id: 3, bg: 'bg-green-300' },
		{ id: 4, bg: 'bg-yellow-300' },
		{ id: 5, bg: 'bg-purple-300' },
		{ id: 6, bg: 'bg-pink-300' },
		{ id: 7, bg: 'bg-indigo-300' },
		{ id: 8, bg: 'bg-gray-300' }
	];
	const carouselOptions = {
		breakpoints: {
			'(min-width: 400px)': {
				slides: { perView: 2.5, spacing: 10 }
			},
			'(min-width: 1000px)': {
				slides: { perView: 3.3, spacing: 10 }
			}
		},
		loop: true
	};

	let activeIndex = 0;
</script>

<section class="w-full p-8">
	<h1 class="mb-8 text-2xl font-bold">Carousel Test</h1>
	<div class="relative mt-3 w-full overflow-hidden p-4">
		<Carousel options={carouselOptions}>
			{#each items as { id, bg }}
				<div
					class="flex h-[240px] items-center justify-center {bg} carousel__flex text-xl font-bold"
					data-data-carousel-slide={id}
				>
					Slide {id}
				</div>
			{/each}
		</Carousel>
		<div class="my-4"></div>
		<Carousel options={{ ...carouselOptions, loop: false }}>
			{#each items as { id, bg }}
				<div
					class="flex h-[240px] items-center justify-center {bg} carousel__flex text-xl font-bold"
					data-data-carousel-slide={id}
				>
					Slide {id}
				</div>
			{/each}
		</Carousel>
	</div>
	<div class="mt-8 flex items-center justify-center space-x-4">
		<button
			on:click={() => {}}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-white shadow-md transition-colors duration-200 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
			aria-label="Previous slide"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
			>
		</button>

		<div class="flex items-center justify-center space-x-2">
			{#each [1, 2, 3, 4, 5, 6, 7, 8] as _, i (i)}
				<button
					on:click={() => {}}
					class="h-3 w-3 rounded-full transition-all duration-300 {activeIndex === i
						? 'scale-125 bg-sky-400'
						: 'bg-gray-600 hover:bg-gray-500'}"
					aria-label="Go to slide {i + 1}"
				></button>
			{/each}
		</div>

		<button
			on:click={() => {}}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-white shadow-md transition-colors duration-200 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
			aria-label="Next slide"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg
			>
		</button>
	</div>

	<div class="mt-8 text-center text-gray-600">
		<p>Current slide: {activeIndex + 1} / 8</p>
		<p class="text-sm">Try dragging the carousel or using keyboard arrows (focus first)</p>
	</div>
</section>

<style>
</style>
