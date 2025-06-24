<svelte:head>
	<title>Home – Beetcode</title>
</svelte:head>

<section class="home">
	<h1>Welcome back</h1>
	<p>Work in progress.</p>

	<div class="dashboard">
		<div class="card">
			<h2>Recently solved</h2>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
		</div>

		<div class="card">
			<h2>Stats</h2>
			<p>Solved: 12 / 30 challenges</p>
		</div>
	</div>
</section>

<style>
	.home {
		max-width: 48rem;
		margin: 5rem auto;
		padding: 0 1rem;
		text-align: center;
	}

	h1 {
		font-size: 1.5rem;
		margin-bottom: 1.5rem;
		color: var(--color-primary);
	}

	p {
		font-size: 0.85rem;
		color: var(--color-text);
		margin-bottom: 2rem;
	}

	.dashboard {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.card {
		border: 2px solid var(--color-accent-1);
		padding: 1rem;
		border-radius: 6px;
		background: var(--color-tile);
		text-align: left;
	}

	.card h2 {
		font-size: 1rem;
		color: var(--color-accent-2);
		margin-bottom: 0.5rem;
	}

	.card p {
		font-size: 0.75rem;
		color: var(--color-text);
	}
</style>
