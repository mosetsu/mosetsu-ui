<script>
	import Arena from './Arena.svelte';
</script>

<section class="flex h-full w-full flex-col bg-[#f5f5f5]">
	<header class="flex h-16 items-center justify-center border-b border-gray-200 bg-white p-2">
		<div class="flex flex-col text-center">
			<span class="mb-0.5 text-sm text-black">Custom Spec</span>
			<span class="text-sm text-gray-500">overview of system flow</span>
		</div>
	</header>
	<div id="arena" class="flex flex-1">
		<Arena />
	</div>
	<footer class="mt-auto flex h-14 items-center border-t border-gray-200 bg-white p-3">
		<button
			class="mr-4 cursor-pointer rounded border border-gray-300 px-3 py-1 text-xs text-black hover:bg-gray-100 focus:outline-none"
			>Share</button
		>
		<button
			class="cursor-pointer rounded border border-gray-300 px-3 py-1 text-xs text-black hover:bg-gray-100 focus:outline-none"
			>Modules</button
		>
		<button
			class="mx-auto cursor-pointer rounded border border-gray-300 px-3 py-1 text-xs text-black hover:bg-gray-100 focus:outline-none"
			>Start Simulation</button
		>
	</footer>
</section>

<style>
	#arena {
		--grid-gap: 1.5px;
		background-image:
			linear-gradient(90deg, #fff var(--grid-gap), #0000 var(--grid-gap)),
			linear-gradient(#fff var(--grid-gap), #0000 var(--grid-gap));
		background-size: 16px 16px;
	}
</style>
