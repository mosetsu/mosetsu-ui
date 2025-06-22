<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Mosetsu | System Design</title>
	<meta name="description" content="Mosetsu | System Design" />
	<meta property="og:title" content="Mosetsu | System Design" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<main class="flex min-h-screen min-w-screen flex-col bg-gray-900 text-gray-200 font-mono">
	{@render children()}
</main>
