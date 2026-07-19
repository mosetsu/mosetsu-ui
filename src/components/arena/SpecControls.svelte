<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { get } from 'svelte/store';
	import { drawState } from '$components/arena/helper/draw.svelte.ts';
	import { blockStore } from '$stores/block';
	import { specStore, setSpec, resetSpec, newSpecId, DEFAULT_SPEC_NAME } from '$stores/spec';
	import { serializeDesign } from '$lib/design/serialize';
	import { saveSpec, clearDraft } from '$lib/design/persistence';
	import { portal } from '$actions/portal';

	let dialog = $state<'name' | 'new' | null>(null);
	let nameInput = $state('');
	let toast = $state('');
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const flash = (msg: string) => {
		toast = msg;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (toast = ''), 1800);
	};

	const buildDesign = (id: string, name: string) =>
		serializeDesign(drawState.nodes, drawState.edges, { id, name, updatedAt: Date.now() });

	function onSaveClick() {
		const spec = get(specStore);
		if (spec.id === null) {
			// First save of a new spec → ask for a name once.
			nameInput = spec.name === DEFAULT_SPEC_NAME ? '' : spec.name;
			dialog = 'name';
		} else {
			// Existing spec → silently override.
			void saveSpec(buildDesign(spec.id, spec.name));
			flash('Saved');
		}
	}

	function confirmName() {
		const spec = get(specStore);
		const name = nameInput.trim() || DEFAULT_SPEC_NAME;
		const id = spec.id ?? newSpecId();
		setSpec({ id, name });
		void saveSpec(buildDesign(id, name));
		dialog = null;
		flash(`Saved “${name}”`);
	}

	function onNewClick() {
		if (drawState.nodes.length === 0) {
			doNew();
		} else {
			dialog = 'new';
		}
	}

	function doNew() {
		drawState.clearGraph();
		blockStore.clear();
		resetSpec();
		void clearDraft();
		dialog = null;
	}
</script>

<button
	class="border-accent-primary/40 bg-accent-primary/10 text-accent-hover hover:bg-accent-primary flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all hover:text-white focus:outline-none"
	onclick={onSaveClick}
	title="Save this spec"
>
	<svg
		class="h-3.5 w-3.5"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
		<path d="M17 21v-8H7v8M7 3v5h8" />
	</svg>
	Save
</button>

<button
	class="border-dark-border bg-dark-elevated/60 text-text-secondary hover:border-dark-border-strong hover:text-text-primary flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none"
	onclick={onNewClick}
	title="Start a new spec"
>
	<svg
		class="h-3.5 w-3.5"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M12 5v14M5 12h14" />
	</svg>
	New
</button>

{#if toast}
	<div
		class="glass-elevated border-accent-primary/30 text-text-primary absolute -top-11 left-1/2 -translate-x-1/2 rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap shadow-xl"
		transition:fly={{ y: 8, duration: 160 }}
	>
		{toast}
	</div>
{/if}

{#if dialog}
	<div
		use:portal
		class="bg-dark-base/70 fixed inset-0 z-[80] flex items-center justify-center p-6 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
		role="button"
		tabindex="-1"
		aria-label="Close dialog"
		onclick={(e) => e.target === e.currentTarget && (dialog = null)}
		onkeydown={(e) => e.key === 'Escape' && (dialog = null)}
	>
		<div
			class="glass-elevated border-dark-border-strong/40 w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
			transition:fly={{ y: 10, duration: 180 }}
			role="dialog"
			aria-modal="true"
		>
			{#if dialog === 'name'}
				<h3 class="text-text-primary mb-1 text-base font-semibold tracking-tight">Save spec</h3>
				<p class="text-text-subtle mb-4 text-xs">Give it a name — this appears in the header.</p>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					class="border-dark-border bg-dark-surface text-text-primary focus:border-accent-primary/60 mb-5 w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none"
					placeholder={DEFAULT_SPEC_NAME}
					bind:value={nameInput}
					autofocus
					onkeydown={(e) => e.key === 'Enter' && confirmName()}
				/>
				<div class="flex justify-end gap-2">
					<button
						class="text-text-secondary hover:bg-dark-highlight cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors"
						onclick={() => (dialog = null)}>Cancel</button
					>
					<button
						class="bg-accent-primary hover:bg-accent-hover glow-accent cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all"
						onclick={confirmName}>Save</button
					>
				</div>
			{:else}
				<h3 class="text-text-primary mb-1 text-base font-semibold tracking-tight">
					Start a new spec?
				</h3>
				<p class="text-text-subtle mb-5 text-xs">
					The canvas will be cleared. Any saved specs stay in Explore, but unsaved changes to the
					current draft will be discarded.
				</p>
				<div class="flex justify-end gap-2">
					<button
						class="text-text-secondary hover:bg-dark-highlight cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors"
						onclick={() => (dialog = null)}>Cancel</button
					>
					<button
						class="bg-accent-primary hover:bg-accent-hover glow-accent cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all"
						onclick={doNew}>New spec</button
					>
				</div>
			{/if}
		</div>
	</div>
{/if}
