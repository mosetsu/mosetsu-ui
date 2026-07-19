<script lang="ts">
	import commonStore from '$stores/common';

	let simulationActive = $derived($commonStore.isSimulationActive);
</script>

<div
	class="glass-elevated border-dark-border-strong/40 flex items-center gap-2.5 rounded-full border px-4 py-2 shadow-xl"
>
	<span
		class={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase transition-colors duration-300 ` +
			(simulationActive
				? 'border-accent-primary/40 bg-accent-primary/10 text-accent-hover'
				: 'border-dark-border-strong/50 bg-dark-elevated text-text-subtle')}
	>
		<span
			class={`inline-block h-1.5 w-1.5 rounded-full ` +
				(simulationActive ? 'bg-accent-primary animate-pulse' : 'bg-text-faint')}
		></span>
		{simulationActive ? 'Live' : 'Idle'}
	</span>
	<span class="text-text-primary text-sm font-semibold tracking-tight">Custom Spec</span>
	<span class="text-text-subtle hidden text-xs sm:inline">overview of system flow</span>
</div>
