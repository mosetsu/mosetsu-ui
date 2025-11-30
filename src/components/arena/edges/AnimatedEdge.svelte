<script lang="ts">
	import { BaseEdge, getBezierPath, type EdgeProps, useNodesData } from '@xyflow/svelte';
	import commonStore from '$stores/common';

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

	let isSimulationActive = $derived($commonStore.isSimulationActive);

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

	const sourceNode = useNodesData(source);
	const targetNode = useNodesData(target);

	const getTafficCongestion = (sMetrics: number, tMetrics: number) => {
		try {
			const congestion = Number((sMetrics / tMetrics).toFixed(2)) * 100;

			return congestion;
		} catch (error) {
			return 0;
		}
	};

	const [color, speed] = $derived.by(() => {
		const sMetrics = sourceNode.current?.data?.metrics as number;
		const tMetrics = targetNode.current?.data?.metrics as number;

		if (!sMetrics || !tMetrics) {
			return ['#4caf50', '1.2s'];
		}

		const congestion = getTafficCongestion(sMetrics, tMetrics);

		if (congestion < 50) {
			return ['#4caf50', '1.2s'];
		}

		if (congestion < 80) {
			return ['#FFC50F', '2.0s'];
		}

		return ['#D97D55', '4.0s'];
	});
</script>

<BaseEdge
	{id}
	{path}
	class="transition-colors duration-500"
	style="stroke-width: 1; stroke: {selected ? '#000' : color};"
/>

{#if isSimulationActive}
	<circle r="4" fill={color} class="pointer-events-none transition-colors duration-500">
		<animateMotion dur={speed} repeatCount="indefinite">
			<mpath href="#{id}" />
		</animateMotion>
	</circle>
{/if}
