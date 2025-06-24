<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '../ThemeToggle.svelte';
</script>

<header>
	<a href="/" class="logo">
		BEETCODE
	</a>

	<nav>
		<ul>
			<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">About Us</a>
			</li>
			<li aria-current={$page.url.pathname === '/learnmore' ? 'page' : undefined}>
				<a href="/learnmore">Learn More</a>
			</li>
			<li aria-current={$page.url.pathname === '/login' ? 'page' : undefined}>
				<a href="/login">Log In</a>
			</li>
			<li aria-current={$page.url.pathname === '/signup' ? 'page' : undefined}>
				<a href="/signup">Sign Up</a>
			</li>
		</ul>
	</nav>

	<ThemeToggle />
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background-color: var(--color-bg);
		color: var(--color-text);
		border-bottom: 2px solid var(--color-accent-1);
		font-family: var(--font-body);
	}

	.logo {
		text-decoration: none;
		color: var(--color-primary);
		font-size: 1rem;
	}

	nav ul {
		display: flex;
		gap: 1.5rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	nav a {
		text-decoration: none;
		color: var(--color-text);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	nav a:hover {
		color: var(--color-primary);
	}

	li[aria-current='page'] a {
		border-bottom: 2px solid var(--color-primary);
	}
</style>
