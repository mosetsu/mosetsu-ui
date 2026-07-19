<script lang="ts">
	import { Position, type NodeProps } from '@xyflow/svelte';
	import { selectBlock } from '$components/arena/canvas-state/selectBlock';
	import { openTooling } from '$stores/panels';
	import ConnectedHandle from './ConnectedHandle.svelte';
	import type { RabbitMQMetrics } from '$stores/selection';
	import simulationStore from '$stores/simulation';
	import { onMount, onDestroy } from 'svelte';

	let { id, data }: NodeProps = $props();
	let metrics = $derived(data?.metrics as RabbitMQMetrics);
	const handleClick = () => selectBlock(id, 'rabbitmq', metrics);
	const handleDblClick = () => {
		selectBlock(id, 'rabbitmq', metrics);
		openTooling();
	};

	let isSimulationActive = $derived($simulationStore.isSimulationActive);

	// Metrics derivation
	let inRate = $derived(metrics?.messagesPerSec ?? 500);
	let lag = $derived(metrics?.queueDepth ?? 0);

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

	type Particle = {
		x: number;
		y: number;
		vx: number;
		size: number;
		opacity: number;
		phase: number;
		isInternal: boolean;
	};

	let particles: Particle[] = [];

	const createFlowParticle = (): Particle => ({
		x: -20 - Math.random() * 40,
		y: 45 + Math.random() * 30,
		vx: 1.5 + Math.random() * 2,
		size: 3 + Math.random() * 4,
		opacity: 0.6 + Math.random() * 0.4,
		phase: Math.random() * Math.PI * 2,
		isInternal: false
	});

	const createInternalParticle = (): Particle => ({
		x: 80 + Math.random() * 160,
		y: 25 + Math.random() * 70,
		vx: (Math.random() - 0.5) * 0.3,
		size: 3 + Math.random() * 5,
		opacity: 0.4 + Math.random() * 0.5,
		phase: Math.random() * Math.PI * 2,
		isInternal: true
	});

	const initParticles = () => {
		particles = [];
		// Internal particles based on congestion
		const internalCount = 15 + Math.floor(congestionRatio * 0.5);
		for (let i = 0; i < internalCount; i++) {
			particles.push(createInternalParticle());
		}
		// Flow particles
		for (let i = 0; i < 25; i++) {
			const p = createFlowParticle();
			p.x = Math.random() * 380 - 30;
			particles.push(p);
		}
	};

	const drawCapsule = (ctx: CanvasRenderingContext2D, status: string) => {
		const borderColor =
			status === 'congested'
				? 'rgba(217, 125, 85, 0.8)'
				: status === 'warning'
					? 'rgba(255, 197, 15, 0.6)'
					: 'rgba(58, 124, 230, 0.6)';
		const fillColor =
			status === 'congested'
				? 'rgba(217, 125, 85, 0.12)'
				: status === 'warning'
					? 'rgba(255, 197, 15, 0.08)'
					: 'rgba(58, 124, 230, 0.08)';
		const glowColor =
			status === 'congested'
				? 'rgba(217, 125, 85, 0.4)'
				: status === 'warning'
					? 'rgba(255, 197, 15, 0.25)'
					: 'rgba(58, 124, 230, 0.2)';

		// Outer glow
		ctx.shadowColor = glowColor;
		ctx.shadowBlur = 25;

		// Capsule shape with pointed ends
		ctx.beginPath();
		ctx.moveTo(60, 20);
		ctx.lineTo(260, 20);
		ctx.lineTo(300, 60);
		ctx.lineTo(260, 100);
		ctx.lineTo(60, 100);
		ctx.lineTo(20, 60);
		ctx.closePath();

		ctx.fillStyle = fillColor;
		ctx.fill();
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.shadowBlur = 0;

		// Entry arrow (left side)
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0, 60);
		ctx.lineTo(15, 60);
		ctx.stroke();

		// Arrow head
		ctx.beginPath();
		ctx.moveTo(10, 55);
		ctx.lineTo(18, 60);
		ctx.lineTo(10, 65);
		ctx.stroke();

		// Exit arrow (right side)
		ctx.beginPath();
		ctx.moveTo(302, 60);
		ctx.lineTo(320, 60);
		ctx.stroke();

		// Arrow head
		ctx.beginPath();
		ctx.moveTo(315, 55);
		ctx.lineTo(323, 60);
		ctx.lineTo(315, 65);
		ctx.stroke();
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

		// Draw capsule container (use healthy status when idle)
		const displayStatus = isSimulationActive ? status : 'healthy';
		drawCapsule(ctx, displayStatus);

		// Colors based on status
		const baseColor =
			displayStatus === 'congested'
				? [217, 125, 85]
				: displayStatus === 'warning'
					? [255, 197, 15]
					: [58, 124, 230];
		const glowColor =
			displayStatus === 'congested'
				? 'rgba(217, 125, 85,'
				: displayStatus === 'warning'
					? 'rgba(255, 197, 15,'
					: 'rgba(58, 124, 230,';

		// Only animate when simulation is active
		if (isSimulationActive) {
			const speedMultiplier = status === 'congested' ? 0.2 : status === 'warning' ? 0.5 : 1;

			for (const p of particles) {
				p.phase += 0.025;

				if (p.isInternal) {
					// Float around inside capsule
					p.x += Math.sin(p.phase) * 0.4;
					p.y += Math.cos(p.phase * 0.7) * 0.3;

					// Keep inside capsule bounds
					if (p.x < 65) p.x = 65;
					if (p.x > 255) p.x = 255;
					if (p.y < 28) p.y = 28;
					if (p.y > 92) p.y = 92;
				} else {
					// Flow particles move left to right
					p.x += p.vx * speedMultiplier;

					// Wobble vertically
					p.y = 50 + Math.sin(p.phase) * 15 + 10;

					// Slow down significantly inside capsule when congested
					if (status === 'congested' && p.x > 60 && p.x < 260) {
						p.vx *= 0.997;
						if (p.vx < 0.3) p.vx = 0.3;
					}

					// Reset when exiting
					if (p.x > width + 30) {
						Object.assign(p, createFlowParticle());
					}
				}
			}
		}

		// Draw all particles (static or animated)
		for (const p of particles) {
			// Draw glow
			const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
			gradient.addColorStop(0, `${glowColor}${p.opacity * 0.8})`);
			gradient.addColorStop(0.4, `${glowColor}${p.opacity * 0.4})`);
			gradient.addColorStop(1, `${glowColor}0)`);
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
			ctx.fill();

			// Draw particle core
			ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${isSimulationActive ? p.opacity : p.opacity * 0.7})`;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx.fill();
		}

		animationId = requestAnimationFrame(animate);
	};

	onMount(() => {
		if (canvas) {
			canvas.width = 330;
			canvas.height = 120;
			initParticles();
			animate();
		}
	});

	onDestroy(() => {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	});

	// Re-init particles when congestion changes significantly
	$effect(() => {
		if (congestionRatio) {
			initParticles();
		}
	});
</script>

<div
	{id}
	class="rabbitmq flex cursor-pointer flex-col items-center rounded-2xl border border-transparent p-1 transition-all duration-200 hover:scale-[1.02]"
	onclick={handleClick}
	ondblclick={handleDblClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<canvas bind:this={canvas} class="block"></canvas>
</div>

<ConnectedHandle nodeId={id} type="target" position={Position.Left} handleId="left" />
<ConnectedHandle nodeId={id} type="source" position={Position.Right} handleId="right" />

<style>
	:global(.selected > .rabbitmq) {
		border-color: var(--color-accent-primary);
	}
</style>
