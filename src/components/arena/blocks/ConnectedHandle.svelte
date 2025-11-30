<script lang="ts">
	import { Handle, useSvelteFlow, type HandleProps } from '@xyflow/svelte';

	type Props = HandleProps & {
		nodeId: string;
		handleId?: string;
	};

	let { nodeId, handleId, type, position, ...restProps }: Props = $props();

	const { getEdges } = useSvelteFlow();

	let isConnected = $derived.by(() => {
		const edges = getEdges();
		return edges.some((edge) => {
			if (type === 'source') {
				return edge.source === nodeId && (!handleId || edge.sourceHandle === handleId);
			} else {
				return edge.target === nodeId && (!handleId || edge.targetHandle === handleId);
			}
		});
	});
</script>

<Handle id={handleId} {type} {position} class={isConnected ? 'connected' : ''} {...restProps} />

<style>
	:global(.connected) {
		background: #4caf50;
		border-color: #4caf50;
		box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
	}
</style>
