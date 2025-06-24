<svelte:head>
	<title>Learn more – Beetcode</title>
</svelte:head>

<section class="learn">
	<h1>How Beetcode works</h1>

	<ol class="steps">
		<li>
			<h2>1. Sign up</h2>
			<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a metus vitae lorem facilisis bibendum.</p>
		</li>
		<li>
			<h2>2. Choose a challenge</h2>
			<p>Sed non risus id purus congue rutrum. Duis vel dapibus erat, sed tristique tellus.</p>
		</li>
		<li>
			<h2>3. Collect ducks!</h2>
			<p>Phasellus nec metus sed lorem sodales gravida. Etiam ut nisi nec nisl fermentum congue.</p>
		</li>
		<li>
			<h2>4. Track your progress</h2>
			<p>Aenean a erat et nisl euismod rhoncus nec a justo. Suspendisse potenti.</p>
		</li>
	</ol>
</section>

<style>
	.learn {
		max-width: 48rem;
		margin: 5rem auto;
		padding: 0 1rem;
	}

	h1 {
		font-size: 1.5rem;
		color: var(--color-primary);
		text-align: center;
		margin-bottom: 2rem;
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 0;
		counter-reset: step;
	}

	.steps li {
		list-style: none;
		padding-left: 1.2rem;
		position: relative;
	}

	.steps li::before {
		content: counter(step);
		counter-increment: step;
		position: absolute;
		left: 0;
		top: 0;
		font-weight: bold;
		color: var(--color-accent-2);
	}

	h2 {
		font-size: 1rem;
		color: var(--color-accent-1);
		margin-bottom: 0.5rem;
	}

	p {
		font-size: 0.85rem;
		color: var(--color-text);
		line-height: 1.6;
	}
</style>
