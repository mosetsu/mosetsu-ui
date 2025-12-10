<script lang="ts">
	import { BaseEdge, getBezierPath, type EdgeProps, useNodesData } from '@xyflow/svelte';
	import commonStore from '$stores/common';

	type Props = EdgeProps;

	const GREEN = {
		solid: '#4CAF50',
		light: '#4CAF5066'
	};

	const YELLOW = {
		solid: '#FFC50F',
		light: '#FFC50F66'
	};

	const RED = {
		solid: '#D97D55',
		light: '#D97D5566'
	};

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
			sourceY: sourceY,
			sourcePosition,
			targetX,
			targetY: targetY,
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

	const { pathColor, send, recv } = $derived.by(() => {
		const sMetrics = sourceNode.current?.data?.metrics as number;
		const tMetrics = targetNode.current?.data?.metrics as number;

		if (!sMetrics || !tMetrics) {
			return {
				pathColor: GREEN.light,
				send: {
					delay: 1,
					color: GREEN.solid
				},
				recv: {
					delay: 1,
					color: GREEN.solid
				}
			};
		}

		const congestion = getTafficCongestion(sMetrics, tMetrics);

		if (congestion < 50) {
			return {
				pathColor: GREEN.light,
				send: {
					delay: 1,
					color: GREEN.solid
				},
				recv: {
					delay: 1,
					color: GREEN.solid
				}
			};
		}

		if (congestion < 80) {
			return {
				pathColor: YELLOW.light,
				send: {
					delay: 1,
					color: GREEN.solid
				},
				recv: {
					delay: 2,
					color: YELLOW.solid
				}
			};
		}

		return {
			pathColor: RED.light,
			send: {
				delay: 1,
				color: GREEN.solid
			},
			recv: {
				delay: 4,
				color: RED.solid
			}
		};
	});
</script>

<BaseEdge
	{id}
	{path}
	class="transition-colors duration-500"
	style="stroke-width: 2; stroke: {selected ? '#888888' : pathColor};"
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
