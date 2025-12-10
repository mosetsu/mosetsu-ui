<script lang="ts">
	import '../styles/app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Mosetsu | System Design</title>
	<meta name="description" content="Mosetsu | System Design" />
	<meta property="og:title" content="Mosetsu | System Design" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<main class="bg-dark-base text-text-primary flex min-h-screen min-w-screen flex-col font-mono">
	{@render children()}
</main>
