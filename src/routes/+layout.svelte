<script lang="ts">
	import '../styles/app.css';
	import ViewportGuard from '$components/ViewportGuard.svelte';
	import Drawer from '$components/Drawer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>SystemSage | Learn System Design with Interactive Simulations</title>
	<meta
		name="description"
		content="Learn and practice system design with SystemSage. Interactive sandbox for simulating distributed systems - experiment with load balancers, databases, Kafka, RabbitMQ, S3 and more. Free learning tool for interview prep."
	/>
	<meta
		property="og:title"
		content="SystemSage | Learn System Design with Interactive Simulations"
	/>
	<meta
		property="og:description"
		content="Interactive sandbox for learning system design. Simulate distributed systems and practice for technical interviews."
	/>
	<meta property="og:type" content="website" />
	<meta
		name="twitter:title"
		content="SystemSage | Learn System Design with Interactive Simulations"
	/>
	<meta
		name="twitter:description"
		content="Interactive sandbox for learning system design. Simulate distributed systems and practice for interviews!"
	/>
</svelte:head>

<main class="text-text-primary relative h-screen w-full overflow-hidden font-sans">
	{@render children()}

	<!-- Persistent app chrome (shared across routes) -->
	<a href="/" class="absolute top-4 left-5 z-40 flex items-center gap-2.5 no-underline">
		<span class="ic-primary-logo text-accent-primary glow-soft"></span>
		<h1 class="text-text-primary text-lg font-semibold tracking-tight">
			System<span class="text-accent-primary">Sage</span>
		</h1>
	</a>
	<Drawer />
</main>

<ViewportGuard />
