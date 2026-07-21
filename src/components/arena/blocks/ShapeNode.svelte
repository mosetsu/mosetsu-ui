<script lang="ts">
	import { tick } from 'svelte';
	import { type NodeProps } from '@xyflow/svelte';
	import ConnectedHandle from './ConnectedHandle.svelte';
	import { getShape } from '$lib/shapes';
	import { drawState } from '$components/arena/canvas-state/draw.svelte.ts';

	let { id, type, data }: NodeProps = $props();

	let def = $derived(getShape(type as string));

	let editing = $state(false);
	let labelEl = $state<HTMLElement | null>(null);

	// Seed the contenteditable once on mount; we treat it as uncontrolled after
	// that so typing never fights Svelte for the caret position.
	const seedLabel = (node: HTMLElement) => {
		node.textContent = (data?.label as string) ?? '';
	};

	// Double-click to edit (single click / drag keeps moving the node). Focus and
	// select-all once the element has actually become editable.
	const startEdit = async () => {
		editing = true;
		await tick();
		labelEl?.focus();
		if (labelEl) {
			window.getSelection()?.selectAllChildren(labelEl);
		}
	};

	const commit = () => {
		editing = false;
		const text = labelEl?.textContent?.trim() ?? '';
		drawState.updateNodeData(id, { label: text });
		// Drop the lingering text-selection highlight when we leave edit mode.
		window.getSelection()?.removeAllRanges();
	};

	const onKeydown = (event: KeyboardEvent) => {
		// Enter commits (Shift+Enter for a newline); Escape bails out of editing.
		if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Escape') {
			event.preventDefault();
			labelEl?.blur();
		}
	};
</script>

{#if def}
	<div class={`shape-node shape-${def.kind}`} style="--accent: {def.accent}">
		<div class="shape-bg"></div>
		<div
			bind:this={labelEl}
			class="shape-label"
			class:editing
			class:nodrag={editing}
			contenteditable={editing}
			role="textbox"
			aria-label="Shape label"
			tabindex="0"
			data-placeholder="Label"
			use:seedLabel
			ondblclick={startEdit}
			onblur={commit}
			onkeydown={onKeydown}
		></div>
	</div>

	{#each def.handles as handle (handle.id)}
		<ConnectedHandle
			nodeId={id}
			type={handle.type}
			position={handle.position}
			handleId={handle.id}
		/>
	{/each}
{/if}

<style>
	.shape-node {
		position: relative;
	}

	/* The geometry layer — the only thing that gets rotated / skewed, so the
	   label always stays upright and readable. */
	.shape-bg {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			155deg,
			color-mix(in srgb, var(--accent, #f0562b) 15%, var(--color-dark-elevated)) 0%,
			var(--color-dark-elevated) 62%
		);
		border: 1.5px solid color-mix(in srgb, var(--accent, #f0562b) 46%, var(--color-dark-border));
		box-shadow: inset 0 1px 0 color-mix(in srgb, var(--accent, #f0562b) 18%, transparent);
		transition:
			box-shadow 0.2s ease,
			border-color 0.2s ease;
	}

	/* Fills the node so a double-click anywhere on the shape starts editing and
	   the label always sits at the visual centre. */
	.shape-label {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 16px;
		text-align: center;
		outline: none;
		color: var(--color-text-primary);
		font-size: 0.85rem;
		line-height: 1.25;
		overflow-wrap: anywhere;
	}
	.shape-label.editing {
		cursor: text;
	}
	.shape-label:empty::before {
		content: attr(data-placeholder);
		color: var(--color-text-faint);
	}

	/* ---- Per-kind geometry ---------------------------------------------- */
	.shape-rectangle {
		width: 168px;
		height: 84px;
	}
	.shape-rectangle .shape-bg {
		border-radius: 8px;
	}

	.shape-rounded {
		width: 172px;
		height: 80px;
	}
	.shape-rounded .shape-bg {
		border-radius: 999px;
	}

	/* Rotate a 1/√2-sized square so the rhombus fits exactly inside the node box
	   and its vertices meet the box edges — where the handles live. */
	.shape-diamond {
		width: 132px;
		height: 132px;
	}
	.shape-diamond .shape-bg {
		inset: auto;
		top: 50%;
		left: 50%;
		width: 70.71%;
		height: 70.71%;
		border-radius: 10px;
		transform: translate(-50%, -50%) rotate(45deg);
	}
	.shape-diamond .shape-label {
		padding: 0 26px;
	}

	.shape-ellipse {
		width: 172px;
		height: 100px;
	}
	.shape-ellipse .shape-bg {
		border-radius: 50%;
	}

	.shape-circle {
		width: 120px;
		height: 120px;
	}
	.shape-circle .shape-bg {
		border-radius: 50%;
	}
	.shape-circle .shape-label {
		padding: 0 18px;
	}

	.shape-parallelogram {
		width: 184px;
		height: 84px;
	}
	.shape-parallelogram .shape-bg {
		border-radius: 8px;
		transform: skewX(-16deg);
	}
</style>
