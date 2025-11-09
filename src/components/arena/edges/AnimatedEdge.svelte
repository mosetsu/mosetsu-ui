<script lang="ts">
	import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/svelte';
	import commonStore from '$stores/common';

	type Props = EdgeProps;

	let {
		id,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		selected = false
	}: Props = $props();

	// Get simulation state reactively
	let isSimulationActive = $derived($commonStore.isSimulationActive);

	// Calculate path reactively
	let path = $derived(
		getBezierPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition
		})[0]
	);
</script>

<BaseEdge {id} {path} style="stroke-width: 1;" />

{#if isSimulationActive}
	<circle r="4" fill="#4caf50" class="animated-particle">
		<animateMotion dur="1.2s" repeatCount="indefinite">
			<mpath href="#{id}" />
		</animateMotion>
	</circle>
{/if}

{#if selected}
	<BaseEdge {id} {path} style="stroke-width: 2; opacity: 0.3; stroke: #4caf50;" />
{/if}

<style>
	.animated-particle {
		pointer-events: none;
	}
</style>
