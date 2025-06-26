<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '../ThemeToggle.svelte';
</script>

<header>
	<a href="/home" class="logo">BEETCODE</a>

	<nav>
		<ul>
			<li aria-current={$page.url.pathname === '/home' ? 'page' : undefined}>
				<a href="/home">Home</a>
			</li>
			<li><a href="/problems">Problems</a></li>
			<li><a href="/cohorts">Cohorts</a></li>
			<li><a href="/contest">Contest</a></li>
			<li><a href="/leaderboard">Leaderboard</a></li>
			<li><a href="/store">Store</a></li>

		</ul>
	</nav>

	<div class="actions">
		<ThemeToggle />

		<div class="status-badge">
			<div class="half left">Lvl 10</div>
			<div class="divider"></div>
			<div class="half right">$10,000</div>
		</div>

		<a href="/settings" class="user-icon" aria-label="User settings">👤</a>
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 2rem;
		background-color: var(--color-bg);
		border-bottom: 2px solid var(--color-accent-1);
		font-family: var(--font-body);
		flex-wrap: wrap;
		gap: 1rem;
	}

	.logo {
		text-decoration: none;
		color: var(--color-primary);
		font-size: 1rem;
	}

	nav ul {
		display: flex;
		gap: 1.2rem;
		list-style: none;
		margin: 0;
		padding: 0;
		flex-wrap: wrap;
	}

	nav a {
		text-decoration: none;
		color: var(--color-text);
		font-size: 0.68rem;
		text-transform: uppercase;
	}

	nav a:hover {
		color: var(--color-primary);
	}

	li[aria-current='page'] a {
		border-bottom: 2px solid var(--color-primary);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.status-badge {
		position: relative;
		display: flex;
		border: 2px solid var(--color-accent-1);
		border-radius: 999px;
		overflow: hidden;
		font-size: 0.65rem;
		white-space: nowrap;
	}

	.status-badge::before {
		content: '';
		position: absolute;
		top: -25%;
		left: 50%;
		width: 2px;
		height: 150%;
		background: var(--color-accent-1);
		transform: rotate(30deg);
		z-index: 1;
	}

	.half {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem 0.8rem;
		z-index: 2;
	}

	.left {
		padding-left: 1rem;
	    padding-right: 0.8rem;
	}

	.right {
		padding-left: 2rem;
	    padding-right: 0.8rem;
	}

	.user-icon {
		font-size: 1.2rem;
		text-decoration: none;
		color: var(--color-text);
	}

	.user-icon:hover {
		color: var(--color-primary);
	}
</style>
