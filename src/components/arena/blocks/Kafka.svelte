<script lang="ts">
	import { Position, type NodeProps } from '@xyflow/svelte';
	import { selectBlock } from './helper';
	import ConnectedHandle from './ConnectedHandle.svelte';
	import type { KafkaMetrics } from '$stores/block';
	import commonStore from '$stores/common';
	import { onMount, onDestroy } from 'svelte';

	let { id, data }: NodeProps = $props();
	let metrics = $derived(data?.metrics as KafkaMetrics);
	const handleClick = () => selectBlock(id, 'kafka', metrics);

	let isSimulationActive = $derived($commonStore.isSimulationActive);

	// Metrics derivation
	let inRate = $derived(metrics?.messagesPerSec ?? 500);
	let lag = $derived(metrics?.consumerLag ?? 0);

	// Congestion calculation
	let congestionRatio = $derived.by(() => {
		if (inRate === 0) return 0;
		const ratio = (lag / inRate) * 100;
		return Math.min(ratio, 100);
	});

	let status = $derived.by(() => {
		if (congestionRatio < 30) return 'healthy';
		if (congestionRatio < 60) return 'warning';
		return 'congested';
	});

	// Canvas animation
	let canvas: HTMLCanvasElement;
	let animationId: number;

	type MessageBlock = {
		x: number;
		size: number;
		opacity: number;
	};

	let messages: MessageBlock[] = [];
	const MESSAGE_COUNT = 12;
	const TUBE_START = 30;
	const TUBE_END = 370;
	const TUBE_WIDTH = TUBE_END - TUBE_START;

	const initMessages = () => {
		messages = [];
		const spacing = TUBE_WIDTH / MESSAGE_COUNT;
		for (let i = 0; i < MESSAGE_COUNT; i++) {
			messages.push({
				x: TUBE_START + 20 + i * spacing,
				size: 22 + Math.random() * 4,
				opacity: 0.7 + Math.random() * 0.3
			});
		}
	};

	const drawTube = (ctx: CanvasRenderingContext2D, congestionPoint: number) => {
		const tubeY = 25;
		const tubeHeight = 50;
		const centerY = tubeY + tubeHeight / 2;

		// Calculate where congestion starts (0 = no congestion, 1 = full congestion)
		const congestionX = TUBE_START + TUBE_WIDTH * (1 - congestionRatio / 100);

		// Healthy portion (left side) - blue/cyan
		const healthyGradient = ctx.createLinearGradient(0, tubeY, 0, tubeY + tubeHeight);
		healthyGradient.addColorStop(0, 'rgba(58, 124, 230, 0.3)');
		healthyGradient.addColorStop(0.3, 'rgba(58, 124, 230, 0.15)');
		healthyGradient.addColorStop(0.7, 'rgba(58, 124, 230, 0.15)');
		healthyGradient.addColorStop(1, 'rgba(58, 124, 230, 0.3)');

		// Draw healthy portion
		ctx.fillStyle = healthyGradient;
		ctx.beginPath();
		ctx.ellipse(TUBE_START, centerY, 15, tubeHeight / 2, 0, 0, Math.PI * 2);
		ctx.fill();

		if (congestionRatio > 0) {
			// Draw healthy rectangle up to congestion point
			ctx.fillRect(TUBE_START, tubeY, Math.max(0, congestionX - TUBE_START), tubeHeight);

			// Congested portion (right side) - orange/red
			const congestedGradient = ctx.createLinearGradient(0, tubeY, 0, tubeY + tubeHeight);
			congestedGradient.addColorStop(0, 'rgba(217, 125, 85, 0.4)');
			congestedGradient.addColorStop(0.3, 'rgba(217, 125, 85, 0.2)');
			congestedGradient.addColorStop(0.7, 'rgba(217, 125, 85, 0.2)');
			congestedGradient.addColorStop(1, 'rgba(217, 125, 85, 0.4)');

			ctx.fillStyle = congestedGradient;
			ctx.fillRect(congestionX, tubeY, TUBE_END - congestionX, tubeHeight);

			// Congestion divider line
			ctx.strokeStyle = 'rgba(217, 125, 85, 0.9)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(congestionX, tubeY);
			ctx.lineTo(congestionX, tubeY + tubeHeight);
			ctx.stroke();

			// Glow on congestion line
			ctx.shadowColor = 'rgba(217, 125, 85, 0.8)';
			ctx.shadowBlur = 10;
			ctx.beginPath();
			ctx.moveTo(congestionX, tubeY);
			ctx.lineTo(congestionX, tubeY + tubeHeight);
			ctx.stroke();
			ctx.shadowBlur = 0;

			// Right cap (congested)
			ctx.fillStyle = congestedGradient;
			ctx.beginPath();
			ctx.ellipse(TUBE_END, centerY, 15, tubeHeight / 2, 0, 0, Math.PI * 2);
			ctx.fill();
		} else {
			// No congestion - all healthy
			ctx.fillRect(TUBE_START, tubeY, TUBE_WIDTH, tubeHeight);
			ctx.beginPath();
			ctx.ellipse(TUBE_END, centerY, 15, tubeHeight / 2, 0, 0, Math.PI * 2);
			ctx.fill();
		}

		// Tube border - healthy side
		ctx.strokeStyle = 'rgba(58, 124, 230, 0.5)';
		ctx.lineWidth = 2;
		
		// Top and bottom lines (healthy portion)
		const healthyEndX = congestionRatio > 0 ? congestionX : TUBE_END;
		ctx.beginPath();
		ctx.moveTo(TUBE_START, tubeY);
		ctx.lineTo(healthyEndX, tubeY);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(TUBE_START, tubeY + tubeHeight);
		ctx.lineTo(healthyEndX, tubeY + tubeHeight);
		ctx.stroke();

		// Left cap outline
		ctx.beginPath();
		ctx.ellipse(TUBE_START, centerY, 15, tubeHeight / 2, 0, Math.PI / 2, -Math.PI / 2);
		ctx.stroke();

		if (congestionRatio > 0) {
			// Congested border
			ctx.strokeStyle = 'rgba(217, 125, 85, 0.7)';
			ctx.beginPath();
			ctx.moveTo(congestionX, tubeY);
			ctx.lineTo(TUBE_END, tubeY);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(congestionX, tubeY + tubeHeight);
			ctx.lineTo(TUBE_END, tubeY + tubeHeight);
			ctx.stroke();

			// Right cap outline (congested)
			ctx.beginPath();
			ctx.ellipse(TUBE_END, centerY, 15, tubeHeight / 2, 0, -Math.PI / 2, Math.PI / 2);
			ctx.stroke();
		} else {
			// Right cap outline (healthy)
			ctx.beginPath();
			ctx.ellipse(TUBE_END, centerY, 15, tubeHeight / 2, 0, -Math.PI / 2, Math.PI / 2);
			ctx.stroke();
		}

		// Entry dots (left)
		ctx.fillStyle = 'rgba(58, 124, 230, 0.8)';
		ctx.beginPath();
		ctx.arc(8, centerY, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(18, centerY, 3, 0, Math.PI * 2);
		ctx.fill();

		// Exit dots (right)
		const exitColor = congestionRatio > 50 ? 'rgba(217, 125, 85, 0.8)' : 'rgba(58, 124, 230, 0.8)';
		ctx.fillStyle = exitColor;
		ctx.beginPath();
		ctx.arc(390, centerY, 3, 0, Math.PI * 2);
		ctx.fill();
	};

	const animate = () => {
		if (!canvas) {
			animationId = requestAnimationFrame(animate);
			return;
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;

		ctx.clearRect(0, 0, width, height);

		// Draw tube with congestion visualization
		const congestionX = TUBE_START + TUBE_WIDTH * (1 - congestionRatio / 100);
		drawTube(ctx, congestionX);

		if (!isSimulationActive) {
			// Draw static messages when not running
			const centerY = 50;
			for (const msg of messages) {
				const isInCongestion = msg.x > congestionX && congestionRatio > 0;
				const color = isInCongestion ? 'rgba(217, 125, 85, 0.6)' : 'rgba(58, 124, 230, 0.6)';
				
				ctx.fillStyle = color;
				const halfSize = msg.size / 2;
				ctx.beginPath();
				ctx.roundRect(msg.x - halfSize, centerY - halfSize, msg.size, msg.size, 3);
				ctx.fill();
			}
			
			animationId = requestAnimationFrame(animate);
			return;
		}

		// Animation speed based on congestion
		const baseSpeed = 1.2;
		const speedMultiplier = status === 'congested' ? 0.15 : status === 'warning' ? 0.4 : 1;
		const centerY = 50;

		for (const msg of messages) {
			// Determine if message is in congested zone
			const isInCongestion = msg.x > congestionX && congestionRatio > 0;
			
			// Speed varies based on position
			let speed = baseSpeed * speedMultiplier;
			if (isInCongestion) {
				speed *= 0.3; // Even slower in congested zone
			}

			msg.x += speed;

			// Reset when exiting tube
			if (msg.x > TUBE_END + 20) {
				msg.x = TUBE_START - 10;
				msg.size = 22 + Math.random() * 4;
			}

			// Draw message block
			const color = isInCongestion 
				? [217, 125, 85] 
				: status === 'warning' && msg.x > congestionX - 50
					? [255, 197, 15]
					: [58, 124, 230];

			// Glow
			const glowColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.4)`;
			ctx.shadowColor = glowColor;
			ctx.shadowBlur = 8;

			// Message square
			ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${msg.opacity * 0.7})`;
			const halfSize = msg.size / 2;
			ctx.beginPath();
			ctx.roundRect(msg.x - halfSize, centerY - halfSize, msg.size, msg.size, 3);
			ctx.fill();

			// Lighter center
			ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${msg.opacity * 0.4})`;
			ctx.beginPath();
			ctx.roundRect(msg.x - halfSize + 4, centerY - halfSize + 4, msg.size - 8, msg.size - 8, 2);
			ctx.fill();

			ctx.shadowBlur = 0;
		}

		animationId = requestAnimationFrame(animate);
	};

	onMount(() => {
		if (canvas) {
			canvas.width = 400;
			canvas.height = 100;
			initMessages();
			animate();
		}
	});

	onDestroy(() => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	});
</script>

<div
	{id}
	class="kafka flex cursor-pointer flex-col items-center rounded-2xl border border-transparent p-1 transition-all duration-200 hover:scale-[1.02]"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<canvas bind:this={canvas} class="block"></canvas>
</div>

<ConnectedHandle nodeId={id} type="target" position={Position.Left} handleId="left" />
<ConnectedHandle nodeId={id} type="source" position={Position.Right} handleId="right" />

<style>
	:global(.selected > .kafka) {
		border-color: var(--color-accent-primary);
	}
</style>
