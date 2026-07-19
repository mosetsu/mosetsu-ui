<script lang="ts">
	import Modal from '$components/ui/Modal.svelte';
	import { DEFAULT_SPEC_NAME } from '$stores/spec';

	let {
		open = false,
		initial = '',
		onsave = () => {},
		oncancel = () => {}
	}: {
		open?: boolean;
		initial?: string;
		onsave?: (name: string) => void;
		oncancel?: () => void;
	} = $props();

	let name = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (open) {
			name = initial;
			inputEl?.focus();
			inputEl?.select();
		}
	});
</script>

<Modal {open} onclose={oncancel}>
	<h3 class="text-text-primary mb-1 text-base font-semibold tracking-tight">Save spec</h3>
	<p class="text-text-subtle mb-4 text-xs">Give it a name — this appears in the header.</p>
	<input
		bind:this={inputEl}
		bind:value={name}
		class="border-dark-border bg-dark-surface text-text-primary focus:border-accent-primary/60 mb-5 w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none"
		placeholder={DEFAULT_SPEC_NAME}
		onkeydown={(e) => e.key === 'Enter' && onsave(name)}
	/>
	<div class="flex justify-end gap-2">
		<button
			class="text-text-secondary hover:bg-dark-highlight cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors"
			onclick={oncancel}>Cancel</button
		>
		<button
			class="bg-accent-primary hover:bg-accent-hover glow-accent cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all"
			onclick={() => onsave(name)}>Save</button
		>
	</div>
</Modal>
