<script lang="ts">
	import { Handle, useSvelteFlow, type HandleProps } from '@xyflow/svelte';
	import simulationStore from '$stores/simulation';

	type Props = HandleProps & {
		nodeId: string;
		handleId?: string;
	};

	let { nodeId, handleId, type, position, ...restProps }: Props = $props();

	const { getEdges } = useSvelteFlow();
	let live = $derived($simulationStore.isSimulationActive);

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

	// Idle: amber joint. Live: hidden, so the flowing traffic reads clean.
	let handleClass = $derived(isConnected ? (live ? 'connected connected-live' : 'connected') : '');
</script>

<Handle id={handleId} {type} {position} class={handleClass} {...restProps} />

<style>
	/* Idle: on-theme amber joint. */
	:global(.connected) {
		background: var(--color-accent-primary);
		border-color: var(--color-accent-hover);
		box-shadow:
			0 0 0 2px rgba(240, 86, 43, 0.22),
			0 0 8px rgba(255, 115, 38, 0.45);
	}

	/* Live: hide the joints so the flowing, congestion-coloured traffic reads clean. */
	:global(.connected-live) {
		background: transparent;
		border-color: transparent;
		box-shadow: none;
	}
</style>
