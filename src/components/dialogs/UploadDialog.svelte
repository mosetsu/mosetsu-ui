<script lang="ts">
	import Modal from '$components/ui/Modal.svelte';
	import { parseDesign, type SystemDesign } from '$lib/design/schema';
	import { buildSkillText } from '$lib/design/skill';
	import { LAYOUT_LIST, DEFAULT_LAYOUT, type LayoutId } from '$lib/design/layouts';

	let {
		open = false,
		onclose = () => {},
		onsubmit = () => {}
	}: {
		open?: boolean;
		onclose?: () => void;
		onsubmit?: (design: SystemDesign, layout: LayoutId) => void;
	} = $props();

	const skill = buildSkillText();
	let config = $state('');
	let error = $state('');
	let copied = $state(false);
	let layout = $state<LayoutId>(DEFAULT_LAYOUT);

	$effect(() => {
		if (open) {
			config = '';
			error = '';
		}
	});

	async function copySkill() {
		try {
			await navigator.clipboard.writeText(skill);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			/* ignore */
		}
	}

	function submit() {
		error = '';
		if (!config.trim()) {
			error = 'Paste a config JSON first.';
			return;
		}
		let json: unknown;
		try {
			json = JSON.parse(config);
		} catch {
			error = 'That is not valid JSON.';
			return;
		}
		const res = parseDesign(json);
		if (!res.ok) {
			error = res.error;
			return;
		}
		onsubmit(res.design, layout);
	}
</script>

<Modal {open} {onclose} class="max-w-6xl">
	<div class="mb-4 flex items-center justify-between">
		<div>
			<h3 class="text-text-primary text-base font-semibold tracking-tight">
				Upload a system design
			</h3>
			<p class="text-text-subtle text-xs">
				Generate a design with any AI using the skill, then paste the JSON it returns.
			</p>
		</div>
	</div>

	<div class="grid h-[74vh] grid-cols-1 gap-4 md:grid-cols-2">
		<!-- Left: the AI skill -->
		<div class="border-dark-border bg-dark-base/40 flex min-h-0 flex-col rounded-xl border">
			<div class="border-dark-border flex items-center justify-between gap-2 border-b px-3 py-2">
				<span class="text-text-secondary text-xs font-semibold tracking-wide uppercase"
					>AI skill · copy into any model</span
				>
				<button
					class="border-dark-border bg-dark-elevated/60 text-text-secondary hover:text-text-primary hover:border-dark-border-strong cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-all focus:outline-none"
					onclick={copySkill}
				>
					{copied ? 'Copied ✓' : 'Copy skill'}
				</button>
			</div>
			<pre
				class="no-scrollbar text-text-secondary flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">{skill}</pre>
		</div>

		<!-- Right: paste config -->
		<div class="flex min-h-0 flex-col">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-text-secondary text-xs font-semibold tracking-wide uppercase"
					>Paste config JSON</span
				>
				<div
					class="border-dark-border bg-dark-elevated/60 flex items-center gap-0.5 rounded-lg border p-0.5"
				>
					{#each LAYOUT_LIST as l (l.id)}
						<button
							class={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all focus:outline-none ` +
								(layout === l.id
									? 'bg-accent-primary/15 text-accent-hover'
									: 'text-text-subtle hover:bg-dark-highlight hover:text-text-primary')}
							onclick={() => (layout = l.id)}
							title={`${l.label} layout`}
							aria-label={`${l.label} layout`}
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
								<path d={l.iconPath} />
							</svg>
						</button>
					{/each}
				</div>
			</div>
			<textarea
				class="no-scrollbar border-dark-border bg-dark-surface text-text-primary focus:border-accent-primary/60 placeholder:text-text-faint min-h-0 flex-1 resize-none rounded-xl border p-3 font-mono text-xs transition-colors outline-none"
				placeholder={'{\n  "version": 1,\n  "name": "My System",\n  "nodes": [...],\n  "edges": [...]\n}'}
				bind:value={config}
				spellcheck="false"
			></textarea>

			{#if error}
				<div
					class="mt-2 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
				>
					<svg
						class="mt-px h-3.5 w-3.5 flex-shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
						/>
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<div class="mt-3 flex justify-end gap-2">
				<button
					class="text-text-secondary hover:bg-dark-highlight cursor-pointer rounded-lg px-4 py-2 text-sm transition-colors"
					onclick={onclose}>Cancel</button
				>
				<button
					class="bg-accent-primary hover:bg-accent-hover glow-accent cursor-pointer rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all"
					onclick={submit}>Upload</button
				>
			</div>
		</div>
	</div>
</Modal>
