<script lang="ts">
	import ActionBar from '$components/arena/ActionBar.svelte';
	import ModuleDock from '$components/arena/ModuleDock.svelte';
	import ShapeDock from '$components/arena/ShapeDock.svelte';
	import Canvas from '$components/arena/Canvas.svelte';
	import DesignSync from '$components/arena/DesignSync.svelte';
	import { toolbarStore } from '$stores/toolbar';

	// Exactly one palette tray is open at a time (or none).
	type Tray = 'modules' | 'blanks' | null;
	let activeTray = $state<Tray>('modules');

	const toggleTray = (tray: Exclude<Tray, null>) => {
		activeTray = activeTray === tray ? null : tray;
		// Switching / closing a tray clears any armed click-to-place selection.
		toolbarStore.reset();
	};
</script>

<section
	class="border-dark-border/50 bg-dark-base absolute inset-2 overflow-hidden rounded-[26px] border"
>
	<!-- Canvas fills the whole stage; everything else floats over it -->
	<div class="absolute inset-0">
		<Canvas />
	</div>
	<div class="ambient-bloom"></div>
	<ModuleDock visible={activeTray === 'modules'} />
	<ShapeDock visible={activeTray === 'blanks'} />
	<ActionBar
		{activeTray}
		onModuleBtnClick={() => toggleTray('modules')}
		onBlankBtnClick={() => toggleTray('blanks')}
	/>
	<DesignSync />
</section>
