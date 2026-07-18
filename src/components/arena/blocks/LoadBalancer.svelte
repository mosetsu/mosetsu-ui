<script lang="ts">
	import { Position, type NodeProps } from '@xyflow/svelte';
	import { selectBlock } from './helper';
	import ConnectedHandle from './ConnectedHandle.svelte';
	import type { LoadBalancerMetrics } from '$stores/block';
	import commonStore from '$stores/common';
	import { onMount, onDestroy } from 'svelte';

	let { id, data }: NodeProps = $props();
	let metrics = $derived(data?.metrics as LoadBalancerMetrics);
	const handleClick = () => selectBlock(id, 'load-balancer', metrics);

	let isSimulationActive = $derived($commonStore.isSimulationActive);

	// Congestion calculation
	let congestionRatio = $derived.by(() => {
		const capacity = metrics?.requestsPerSec ?? 500;
		const active = metrics?.activeConnections ?? 0;
		const backends = metrics?.backendServers ?? 3;
		const effectiveCapacity = capacity * backends;
		return Math.min((active / effectiveCapacity) * 100, 100);
	});

	let status = $derived.by(() => {
		if (congestionRatio < 50) return 'healthy';
		if (congestionRatio < 80) return 'warning';
		return 'congested';
	});

	// Particle animation
	let canvas: HTMLCanvasElement;
	let animationId: number;
	const CHANNEL_COUNT = 4;
	const PARTICLE_COUNT = 35;

	type Particle = {
		x: number;
		y: number;
		vy: number;
		channel: number;
		size: number;
		opacity: number;
		phase: number;
	};

	let particles: Particle[] = [];

	const createParticle = (): Particle => {
		const channel = Math.floor(Math.random() * CHANNEL_COUNT);
		return {
			x: 0,
			y: -Math.random() * 50,
			vy: 1.5 + Math.random() * 2,
			channel,
			size: 3 + Math.random() * 3,
			opacity: 0.6 + Math.random() * 0.4,
			phase: Math.random() * Math.PI * 2
		};
	};

	const initParticles = () => {
		particles = [];
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const p = createParticle();
			p.y = Math.random() * 160; // Spread across canvas
			particles.push(p);
		}
	};

	const drawStaticFrame = (ctx: CanvasRenderingContext2D) => {
		const width = canvas.width;
		const height = canvas.height;
		const channelWidth = width / CHANNEL_COUNT;
		const channelPadding = 6;

		ctx.clearRect(0, 0, width, height);

		// Draw channel backgrounds
		const channelColor = 'rgba(58, 124, 230, 0.12)';
		for (let i = 0; i < CHANNEL_COUNT; i++) {
			const x = i * channelWidth + channelPadding;
			ctx.fillStyle = channelColor;
			ctx.beginPath();
			ctx.roundRect(x, 8, channelWidth - channelPadding * 2, height - 16, 4);
			ctx.fill();
		}

		// Draw static particles
		const baseColor = [58, 124, 230];
		const glowColor = 'rgba(58, 124, 230,';

		for (const p of particles) {
			const channelX = p.channel * channelWidth + channelWidth / 2;

			// Draw glow
			const gradient = ctx.createRadialGradient(channelX, p.y, 0, channelX, p.y, p.size * 2.5);
			gradient.addColorStop(0, `${glowColor}${p.opacity * 0.5})`);
			gradient.addColorStop(0.5, `${glowColor}${p.opacity * 0.2})`);
			gradient.addColorStop(1, `${glowColor}0)`);
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(channelX, p.y, p.size * 2.5, 0, Math.PI * 2);
			ctx.fill();

			// Draw particle
			ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${p.opacity * 0.7})`;
			ctx.beginPath();
			ctx.arc(channelX, p.y, p.size, 0, Math.PI * 2);
			ctx.fill();
		}
	};

	const animate = () => {
		if (!canvas) {
			animationId = requestAnimationFrame(animate);
			return;
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Draw static frame when simulation is not active
		if (!isSimulationActive) {
			drawStaticFrame(ctx);
			animationId = requestAnimationFrame(animate);
			return;
		}

		const width = canvas.width;
		const height = canvas.height;
		const channelWidth = width / CHANNEL_COUNT;
		const channelPadding = 6;

		ctx.clearRect(0, 0, width, height);

		// Draw channel backgrounds
		const channelColor =
			status === 'congested'
				? 'rgba(217, 125, 85, 0.12)'
				: status === 'warning'
					? 'rgba(255, 197, 15, 0.12)'
					: 'rgba(58, 124, 230, 0.12)';

		for (let i = 0; i < CHANNEL_COUNT; i++) {
			const x = i * channelWidth + channelPadding;
			ctx.fillStyle = channelColor;
			ctx.beginPath();
			ctx.roundRect(x, 8, channelWidth - channelPadding * 2, height - 16, 4);
			ctx.fill();
		}

		// Colors based on status
		const baseColor =
			status === 'congested'
				? [217, 125, 85]
				: status === 'warning'
					? [255, 197, 15]
					: [58, 124, 230];
		const glowColor =
			status === 'congested'
				? 'rgba(217, 125, 85,'
				: status === 'warning'
					? 'rgba(255, 197, 15,'
					: 'rgba(58, 124, 230,';

		const speedMultiplier = status === 'congested' ? 0.2 : status === 'warning' ? 0.45 : 0.7;
		const backpressure = status === 'congested' ? 0.6 : 0;

		for (const p of particles) {
			let effectiveSpeed = p.vy * speedMultiplier;
			if (backpressure > 0 && p.y < height * 0.25) {
				effectiveSpeed *= 1 - backpressure * (1 - p.y / (height * 0.25));
			}

			p.y += effectiveSpeed;
			p.phase += 0.04;

			const wobble = Math.sin(p.phase) * 2;
			const channelX = p.channel * channelWidth + channelWidth / 2 + wobble;

			if (p.y > height + 10) {
				Object.assign(p, createParticle());
				p.y = -10;
			}

			// Draw glow
			const gradient = ctx.createRadialGradient(channelX, p.y, 0, channelX, p.y, p.size * 2.5);
			gradient.addColorStop(0, `${glowColor}${p.opacity * 0.7})`);
			gradient.addColorStop(0.5, `${glowColor}${p.opacity * 0.25})`);
			gradient.addColorStop(1, `${glowColor}0)`);
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(channelX, p.y, p.size * 2.5, 0, Math.PI * 2);
			ctx.fill();

			// Draw particle
			ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${p.opacity})`;
			ctx.beginPath();
			ctx.arc(channelX, p.y, p.size, 0, Math.PI * 2);
			ctx.fill();
		}

		// Overflow particles when congested
		if (status === 'congested') {
			const overflowCount = Math.floor(congestionRatio / 15);
			for (let i = 0; i < overflowCount; i++) {
				const ox = 15 + Math.random() * (width - 30);
				const oy = -3 - Math.random() * 15;
				const size = 3 + Math.random() * 2;

				ctx.fillStyle = 'rgba(217, 125, 85, 0.8)';
				ctx.beginPath();
				ctx.arc(ox, oy, size, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		animationId = requestAnimationFrame(animate);
	};

	onMount(() => {
		if (canvas) {
			canvas.width = 140;
			canvas.height = 140;
			initParticles();
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
	class="load-balancer flex cursor-pointer flex-col rounded-2xl border border-transparent p-1 shadow-lg transition-all duration-200 hover:scale-[1.02]"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<div class="bg-dark-elevated border-dark-border flex flex-col rounded-xl border p-3">
		<div class="mb-2.5 flex gap-2.5">
			<span class="bg-dark-dots flex items-center rounded-lg px-2 py-1.5">
				<span class="ic-load-balancer scale-110"></span>
			</span>
			<div class="flex flex-col">
				<span class="text-text-primary my-auto text-sm font-medium">Load Balancer</span>
			</div>
		</div>

		<div
			class="bg-dark-base relative aspect-square h-[280px] w-[180px] overflow-hidden rounded-xl border-none p-1 transition-all duration-200"
			class:container-healthy={status === 'healthy' || !isSimulationActive}
			class:container-warning={status === 'warning' && isSimulationActive}
			class:container-congested={status === 'congested' && isSimulationActive}
		>
			<canvas bind:this={canvas} class="mx-auto block h-full w-full"></canvas>
		</div>

		<div class="flex flex-wrap gap-1.5 mt-4">
			<div class="bg-dark-highlight flex items-center gap-1.5 rounded-lg px-2 py-1">
				<img src="/images/request.svg" alt="icon" class="h-3 w-3 opacity-60" />
				<span class="text-text-muted text-sm">{metrics?.requestsPerSec ?? 0}/s</span>
			</div>
			<div class="bg-dark-highlight flex items-center gap-1.5 rounded-lg px-2 py-1">
				<img src="/images/request.svg" alt="icon" class="h-3 w-3 opacity-60" />
				<span class="text-text-muted text-sm">{Math.round(congestionRatio)}% load</span>
			</div>
		</div>
	</div>
</div>

<ConnectedHandle nodeId={id} type="target" position={Position.Left} handleId="left" />
<ConnectedHandle nodeId={id} type="source" position={Position.Right} handleId="right" />

<style>
	.container-warning {
		border-color: rgba(255, 197, 15, 0.5);
		box-shadow:
			0 0 25px rgba(255, 197, 15, 0.25),
			inset 0 0 20px rgba(255, 197, 15, 0.08);
	}

	.container-congested {
		border-color: rgba(217, 125, 85, 0.7);
		box-shadow:
			0 0 35px rgba(217, 125, 85, 0.4),
			inset 0 0 25px rgba(217, 125, 85, 0.15);
		animation: pulse-glow 1.5s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%,
		100% {
			box-shadow:
				0 0 35px rgba(217, 125, 85, 0.4),
				inset 0 0 25px rgba(217, 125, 85, 0.15);
		}
		50% {
			box-shadow:
				0 0 50px rgba(217, 125, 85, 0.55),
				inset 0 0 35px rgba(217, 125, 85, 0.25);
		}
	}

	:global(.selected > .load-balancer) {
		border-color: var(--color-accent-primary);
	}
</style>
