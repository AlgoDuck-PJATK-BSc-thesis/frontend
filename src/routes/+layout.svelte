<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="layout">
	<Header />

	<main>
		{@render children?.()}
	</main>

	<footer>
	<p>© {new Date().getFullYear()} Beetcode</p>
</footer>

</div>

<style>
	.layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg);
		color: var(--color-text);
		font-family: var(--font-body);
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	main {
		flex: 1;
		width: 100%;
		max-width: 48rem;
		margin: 0 auto;
		padding: 2rem 1rem;
		box-sizing: border-box;
	}

	footer {
		text-align: center;
		padding: 1rem;
		color: var(--color-accent-2);
		font-size: 0.75rem;
	}
</style>
