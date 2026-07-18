<script lang="ts">
	import commonStore from '$stores/common';

	let simulationActive = $derived($commonStore.isSimulationActive);
</script>

<header
	class="border-dark-border bg-dark-surface/70 relative z-20 flex h-16 items-center justify-center border-b p-2 backdrop-blur-md"
>
	<div class="flex items-center gap-3">
		<span
			class={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase transition-colors duration-300 ` +
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
		<div class="flex flex-col text-center">
			<span class="text-text-primary text-base font-semibold tracking-tight">Custom Spec</span>
			<span class="text-text-subtle text-xs">overview of system flow</span>
		</div>
	</div>
</header>
