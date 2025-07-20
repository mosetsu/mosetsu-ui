<script lang="ts">
	import { onMount } from 'svelte';
	import KybaController from '$lib/Kyba/main';
	import ModuleInteraction from '$lib/Kyba/enhancers/moduleInteraction/moduleInteraction';
	import Simulation from '$lib/Kyba/enhancers/simulation';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		if (canvas) {
			const ctx = canvas.getContext('2d');
			const arena = document.getElementById('arena') as HTMLDivElement | null;
			if (ctx && arena) {
				KybaController({
					canvas: {
						id: 'kyba',
						width: arena.clientWidth,
						height: arena.clientHeight
					},
					enhancers: [ModuleInteraction, Simulation]
				});
			}
		}
	});
</script>

<canvas id="kyba" bind:this={canvas}></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		cursor: default;
	}
</style>
