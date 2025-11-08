<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';

	type $$Props = NodeProps;

	export let data: { label?: string } = {};
	export let selected = false;
</script>

<div
	class="client-node"
	class:selected
	role="button"
	tabindex="0"
>
	<!-- Handles for connecting edges -->
	<Handle type="target" position={Position.Top} />
	<Handle type="target" position={Position.Left} />
	<Handle type="source" position={Position.Right} />
	<Handle type="source" position={Position.Bottom} />

	<div class="content">
		{#if data.label}
			<span>{data.label}</span>
		{:else}
			<span>Client</span>
		{/if}
	</div>
</div>

<style>
	.client-node {
		width: 200px;
		height: 100px;
		background: #fff;
		border: 1.5px solid #edecef;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: move;
		transition: all 0.2s ease;
	}

	.client-node.selected {
		border-color: #36a2df;
		box-shadow: 0 0 0 2px rgba(54, 162, 223, 0.2);
	}

	.client-node:hover {
		border-color: #d0cfd3;
	}

	.content {
		padding: 12px;
		font-size: 14px;
		color: #333;
		user-select: none;
	}
</style>
