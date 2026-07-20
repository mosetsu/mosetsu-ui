<script lang="ts">
	import { useSvelteFlow } from '@xyflow/svelte';
	import { simulationStore } from '$stores/simulation';

	// A compact "queue lane" — glowing packets tinted by the node's --accent.
	// They only FLOW while the simulation is running and the node is wired into
	// the graph; otherwise the queue sits in a paused (static) state.
	let { nodeId }: { nodeId: string } = $props();

	const { getEdges } = useSvelteFlow();

	let live = $derived($simulationStore);
	let connected = $derived.by(() =>
		getEdges().some((e) => e.source === nodeId || e.target === nodeId)
	);
	let active = $derived(live && connected);

	const COUNT = 7;
	const packets = Array.from({ length: COUNT }, (_, i) => {
		const dur = 1.6 + (i % 3) * 0.35;
		// negative delay → packets staggered across the lane
		const delay = -((i / COUNT) * dur) - (i % 2) * 0.25;
		return { dur, delay };
	});
</script>

<div class="queue-lane" class:paused={!active}>
	{#each packets as p, i (i)}
		<span class="packet" style="animation-duration: {p.dur}s; animation-delay: {p.delay}s"></span>
	{/each}
</div>

<style>
	.queue-lane {
		position: relative;
		height: 20px;
		overflow: hidden;
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent, #f0562b) 10%, var(--color-dark-surface));
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent, #f0562b) 22%, transparent);
	}

	.packet {
		position: absolute;
		top: 50%;
		height: 7px;
		width: 7px;
		margin-top: -3.5px;
		border-radius: 2px;
		background: color-mix(in srgb, var(--accent, #f0562b) 88%, white);
		box-shadow: 0 0 6px color-mix(in srgb, var(--accent, #f0562b) 75%, transparent);
		animation-name: queue-flow;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	/* Idle, or no connections: freeze the queue in place. */
	.queue-lane.paused .packet {
		animation-play-state: paused;
	}

	@keyframes queue-flow {
		0% {
			left: -10px;
			opacity: 0;
		}
		12% {
			opacity: 1;
		}
		88% {
			opacity: 1;
		}
		100% {
			left: 100%;
			opacity: 0;
		}
	}
</style>
