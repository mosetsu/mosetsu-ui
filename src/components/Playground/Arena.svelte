<script lang="ts">
	import { onMount } from 'svelte';
	let canvas: HTMLCanvasElement | undefined;

	onMount(() => {
		if (canvas) {
			const ctx = canvas.getContext('2d');
			const arena = document.getElementById('arena') as HTMLDivElement | null;
			if (ctx && arena) {
				// Set canvas size
				canvas.width = arena.clientWidth;
				canvas.height = arena.clientHeight;

				ctx.strokeStyle = '#8a8a8a';
				ctx.fillStyle = '#FDFDFD';
				ctx.lineWidth = 0.5;
				ctx.beginPath();
				ctx.roundRect(100, 100, 240, 102, [1]);
				ctx.fill();
				ctx.stroke();
			}
		}
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
