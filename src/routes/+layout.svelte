<script lang="ts">
	import '../styles/app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>SystemSage | Learn System Design with Interactive Simulations</title>
	<meta name="description" content="Learn and practice system design with SystemSage. Interactive sandbox for simulating distributed systems - experiment with load balancers, databases, Kafka, RabbitMQ, S3 and more. Free learning tool for interview prep." />
	<meta property="og:title" content="SystemSage | Learn System Design with Interactive Simulations" />
	<meta property="og:description" content="Interactive sandbox for learning system design. Simulate distributed systems and practice for technical interviews." />
	<meta property="og:type" content="website" />
	<meta name="twitter:title" content="SystemSage | Learn System Design with Interactive Simulations" />
	<meta name="twitter:description" content="Interactive sandbox for learning system design. Simulate distributed systems and practice for interviews!" />
</svelte:head>

<main class="bg-dark-base text-text-primary flex min-h-screen min-w-screen flex-col font-mono">
	{@render children()}
</main>
