<script lang="ts">
	import Modal from '$components/ui/Modal.svelte';

	let {
		open = false,
		title = '',
		message = '',
		confirmLabel = 'Confirm',
		onconfirm = () => {},
		oncancel = () => {}
	}: {
		open?: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		onconfirm?: () => void;
		oncancel?: () => void;
	} = $props();
</script>

<Modal {open} onclose={oncancel}>
	<h3 class="text-text-primary mb-1 text-base font-semibold tracking-tight">{title}</h3>
	<p class="text-text-subtle mb-5 text-xs">{message}</p>
	<div class="flex justify-end gap-2">
		<button
			class="text-text-secondary hover:bg-dark-highlight cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors"
			onclick={oncancel}>Cancel</button
		>
		<button
			class="bg-accent-primary hover:bg-accent-hover glow-accent cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all"
			onclick={onconfirm}>{confirmLabel}</button
		>
	</div>
</Modal>
