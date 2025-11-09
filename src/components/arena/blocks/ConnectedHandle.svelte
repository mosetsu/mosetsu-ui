<script lang="ts">
	import { Handle, useSvelteFlow, type HandleProps } from '@xyflow/svelte';

	type Props = HandleProps & {
		nodeId: string;
		handleId?: string;
	};

	let { nodeId, handleId, type, position, ...restProps }: Props = $props();

	const { getEdges } = useSvelteFlow();

	// Reactively check if this handle is connected
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
