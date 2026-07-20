<script lang="ts">
	import { applyDesign } from '$components/arena/canvas-state/applyDesign';
	import type { SystemDesign } from '$lib/design/schema';
	import type { LayoutId } from '$lib/design/layouts';
	import UploadDialog from '$components/dialogs/UploadDialog.svelte';
	import ConfirmDialog from '$components/dialogs/ConfirmDialog.svelte';

	let showUpload = $state(false);
	let showConfirm = $state(false);
	let pending = $state<{ design: SystemDesign; layout: LayoutId } | null>(null);

	// Valid config from the dialog → confirm before replacing the canvas.
	function onValidated(design: SystemDesign, layout: LayoutId) {
		pending = { design, layout };
		showUpload = false;
		showConfirm = true;
	}

	function applyUpload() {
		if (!pending) {
			return;
		}
		// Opens as a NEW unsaved draft — existing saved specs are untouched.
		applyDesign(pending.design, { layoutId: pending.layout });
		pending = null;
		showConfirm = false;
	}
</script>

<button
	class="border-dark-border bg-dark-elevated/60 text-text-secondary hover:border-dark-border-strong hover:text-text-primary flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all focus:outline-none"
	onclick={() => (showUpload = true)}
	title="Upload a system design"
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
		<path d="M12 15V3M7 8l5-5 5 5M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
	</svg>
	Upload
</button>

<UploadDialog open={showUpload} onclose={() => (showUpload = false)} onsubmit={onValidated} />

<ConfirmDialog
	open={showConfirm}
	title="Replace current design?"
	message="Uploading opens a new draft and replaces whatever is on the canvas now. Your saved specs in Explore aren't affected."
	confirmLabel="Upload & replace"
	onconfirm={applyUpload}
	oncancel={() => {
		showConfirm = false;
		pending = null;
	}}
/>
