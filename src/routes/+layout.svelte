<script lang="ts">
	import { page } from '$app/stores';
	import HeaderGuest from './headers/HeaderGuest.svelte';
	import HeaderUser from './headers/HeaderUser.svelte';
	import '../app.css';

	let { children } = $props();

	let path = $page.url.pathname;
	let isLoggedIn =
		path.startsWith('/home') ||
		path.startsWith('/problems') ||
		path.startsWith('/cohorts') ||
		path.startsWith('/contest') ||
		path.startsWith('/leaderboard') ||
		path.startsWith('/settings');
</script>

<div class="layout">
	{#if /* isLoggedIn */ true}
		<HeaderUser />
	{:else}
		<HeaderGuest />
	{/if}

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
		max-width: 100vw;
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
