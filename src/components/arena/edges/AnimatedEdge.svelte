<script lang="ts">
	import { BaseEdge, getBezierPath, type EdgeProps, useSvelteFlow } from '@xyflow/svelte';
	import simulationStore from '$stores/simulation';
	import {
		getEdgeCongestion,
		CONGESTION_COLORS,
		getAnimationDelays
	} from '$lib/simulation/congestion';

	type Props = EdgeProps;

	let {
		id,
		source,
		target,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		selected = false
	}: Props = $props();

	let isSimulationActive = $derived($simulationStore.isSimulationActive);
	const { getNodes, getEdges } = useSvelteFlow();

	let path = $derived(
		getBezierPath({
			sourceX,
			sourceY: sourceY,
			sourcePosition,
			targetX,
			targetY: targetY,
			targetPosition
		})[0]
	);

	const { pathColor, send, recv } = $derived.by(() => {
		const nodes = getNodes();
		const edges = getEdges();
		const congestion = getEdgeCongestion(source, target, nodes, edges);
		const colors = CONGESTION_COLORS[congestion.status];
		const delays = getAnimationDelays(congestion.status);

		return {
			pathColor: colors.light,
			send: { delay: delays.send, color: CONGESTION_COLORS.green.solid },
			recv: { delay: delays.recv, color: colors.solid }
		};
	});
</script>

<BaseEdge
	{id}
	{path}
	class="transition-colors duration-500"
	style="stroke-width: 2; stroke: {selected
		? '#f0562b'
		: isSimulationActive
			? pathColor
			: 'var(--color-idle-edge)'};"
/>

{#if isSimulationActive}
	<circle r="2.5" class="pointer-events-none">
		<animate
			attributeName="fill"
			values="{send.color};{recv.color};{send.color}"
			keyTimes="0;{send.delay / (send.delay + recv.delay)};1"
			dur="{send.delay + recv.delay}s"
			repeatCount="indefinite"
			calcMode="discrete"
		/>
		<animateMotion
			dur="{send.delay + recv.delay}s"
			repeatCount="indefinite"
			keyPoints="0;1;0"
			keyTimes="0;{send.delay / (send.delay + recv.delay)};1"
			calcMode="linear"
		>
			<mpath href="#{id}" />
		</animateMotion>
	</circle>
{/if}
