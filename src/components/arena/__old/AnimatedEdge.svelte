<script lang="ts">
	import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/svelte';
	import { onMount } from 'svelte';

	type $$Props = EdgeProps;

	export let id: $$Props['id'];
	export let sourceX: $$Props['sourceX'];
	export let sourceY: $$Props['sourceY'];
	export let targetX: $$Props['targetX'];
	export let targetY: $$Props['targetY'];
	export let sourcePosition: $$Props['sourcePosition'];
	export let targetPosition: $$Props['targetPosition'];
	export let selected: $$Props['selected'] = false;
	export let data: $$Props['data'] = {};

	let pathElement: SVGPathElement;
	let animatedCircle: SVGCircleElement;

	$: [path] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition
	});

	onMount(() => {
		// Animation will be controlled by GSAP in simulation.ts
		return () => {};
	});
</script>

<BaseEdge {id} {path} style="stroke: #36A2DF; stroke-width: 2;" />

{#if data?.animated}
	<circle
		bind:this={animatedCircle}
		r="4"
		fill="#36A2DF"
		class="animated-particle"
		data-edge-id={id}
	>
		<animateMotion dur="1.5s" repeatCount="indefinite">
			<mpath href="#{id}" />
		</animateMotion>
	</circle>
{/if}

{#if selected}
	<BaseEdge {id} {path} style="stroke: #36A2DF; stroke-width: 4; opacity: 0.3;" />
{/if}

<style>
	.animated-particle {
		pointer-events: none;
	}
</style>
