<script lang="ts">
	import { onMount } from 'svelte';
	import { createBaseModule } from './utils/modules';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		if (canvas) {
			const ctx = canvas.getContext('2d');
			const arena = document.getElementById('arena') as HTMLDivElement | null;
			if (ctx && arena) {
				canvas.width = arena.clientWidth;
				canvas.height = arena.clientHeight;
			}
		}
	});

	const handleClick = (event: MouseEvent) => {
		const ctx = canvas.getContext('2d');
		if (ctx) {
			createBaseModule(ctx, event.offsetX, event.offsetY);
		}
	};
</script>

<canvas bind:this={canvas} onclick={handleClick}></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		cursor: default;
	}
</style>
