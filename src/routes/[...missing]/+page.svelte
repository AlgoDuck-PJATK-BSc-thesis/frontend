<svelte:head>
	<title>404 – Not Found</title>
</svelte:head>

<section class="notfound">
	<h1>404</h1>
	<h2>Not Found</h2>
	<p>The page you are looking for does not exist.</p>
</section>

<style>
	.notfound {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		height: 100%;
		margin-top: 4rem;
	}

	h1 {
		font-size: 2rem;
		color: var(--color-primary);
		margin: 0;
	}

	h2 {
		font-size: 1rem;
		color: var(--color-accent-2);
		margin: 0.5rem 0 1rem;
	}

	p {
		font-size: 0.75rem;
		color: var(--color-text);
	}
</style>