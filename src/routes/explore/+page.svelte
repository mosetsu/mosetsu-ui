<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getModule } from '$lib/modules';
	import { listSpecs, deleteSpec, saveDraft, type SavedSpec } from '$lib/design/persistence';

	let specs = $state<SavedSpec[]>([]);
	let loading = $state(true);

	const load = async () => {
		specs = await listSpecs();
		loading = false;
	};
	onMount(load);

	async function openSpec(spec: SavedSpec) {
		// Make this spec the working draft, then open the arena which restores it.
		await saveDraft(spec.design);
		goto('/');
	}

	async function removeSpec(spec: SavedSpec) {
		await deleteSpec(spec.id);
		await load();
	}

	const fmtWhen = (t: number) => {
		const diff = Date.now() - t;
		const min = Math.round(diff / 60000);
		if (min < 1) {
			return 'just now';
		}
		if (min < 60) {
			return `${min}m ago`;
		}
		const hr = Math.round(min / 60);
		if (hr < 24) {
			return `${hr}h ago`;
		}
		return new Date(t).toLocaleDateString();
	};

	// A few distinct module icons to preview a spec.
	const previewIcons = (spec: SavedSpec) => {
		const seen: string[] = [];
		for (const n of spec.design.nodes) {
			const def = getModule(n.type);
			if (def && !seen.includes(def.type)) {
				seen.push(def.type);
			}
			if (seen.length >= 5) {
				break;
			}
		}
		return seen.map((t) => getModule(t)!);
	};
</script>

<svelte:head>
	<title>Explore · SystemSage</title>
</svelte:head>

<section class="no-scrollbar h-full overflow-y-auto pt-20 pr-8 pb-12 pl-24">
	<div class="mx-auto max-w-5xl">
		<header class="mb-8">
			<h1 class="text-text-primary text-2xl font-semibold tracking-tight">Explore</h1>
			<p class="text-text-subtle mt-1 text-sm">
				Open a saved system design, or browse what others are building.
			</p>
		</header>

		<!-- Locally saved -->
		<div class="mb-4 flex items-center gap-2">
			<h2 class="text-text-secondary text-xs font-semibold tracking-widest uppercase">
				Locally saved
			</h2>
			{#if !loading}
				<span class="text-text-faint font-mono text-xs">{specs.length}</span>
			{/if}
		</div>

		{#if loading}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each [0, 1, 2] as i (i)}
					<div class="bg-dark-highlight/50 h-32 animate-pulse rounded-2xl"></div>
				{/each}
			</div>
		{:else if specs.length === 0}
			<div
				class="glass-elevated border-dark-border/50 flex flex-col items-center gap-2 rounded-2xl border py-12 text-center"
			>
				<span class="ic-base-module text-text-faint scale-150"></span>
				<span class="text-text-secondary text-sm font-medium">No saved specs yet</span>
				<span class="text-text-subtle text-xs">
					Build a system in the Arena and hit <span class="text-accent-hover">Save</span>.
				</span>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each specs as spec (spec.id)}
					<div
						class="glass-elevated border-dark-border-strong/40 hover:border-accent-primary/40 group relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 shadow-lg transition-all"
						onclick={() => openSpec(spec)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && openSpec(spec)}
						role="button"
						tabindex="0"
					>
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0">
								<div class="text-text-primary truncate text-sm font-semibold">{spec.name}</div>
								<div class="text-text-subtle mt-0.5 text-xs">
									{spec.nodeCount} module{spec.nodeCount === 1 ? '' : 's'} · {fmtWhen(
										spec.updatedAt
									)}
								</div>
							</div>
							<button
								class="text-text-faint hover:bg-dark-highlight hover:text-accent-hover flex-shrink-0 cursor-pointer rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 focus:outline-none"
								title="Delete"
								aria-label="Delete spec"
								onclick={(e) => {
									e.stopPropagation();
									removeSpec(spec);
								}}
							>
								<svg
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
								</svg>
							</button>
						</div>

						<div class="flex items-center gap-1.5">
							{#each previewIcons(spec) as def (def.type)}
								<span
									class="node-icon flex items-center rounded-lg px-1.5 py-1"
									style="--accent: {def.accent}"
								>
									<span class={def.icon} style="color: {def.accent}"></span>
								</span>
							{/each}
							{#if spec.nodeCount === 0}
								<span class="text-text-faint text-xs">empty</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Trending -->
		<div class="mt-10 mb-4 flex items-center gap-2">
			<h2 class="text-text-secondary text-xs font-semibold tracking-widest uppercase">Trending</h2>
		</div>
		<div
			class="glass-elevated border-dark-border/50 flex flex-col items-center gap-2 rounded-2xl border py-12 text-center"
		>
			<span class="text-text-secondary text-sm font-medium">Coming soon</span>
			<span class="text-text-subtle text-xs"> Community-shared designs will show up here. </span>
		</div>
	</div>
</section>
