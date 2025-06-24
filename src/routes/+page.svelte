<script lang="ts">
	import image from '$lib/images/image.jpeg';
</script>

<svelte:head>
	<title>Beetcode</title>
	<meta name="description" content="Improve your skills with coding challenges." />
</svelte:head>

<section class="landing">
	<h1>Improve your skills</h1>
	<p>Transform your coding skills, one problem at a time</p>

	<div class="actions">
		<a href="/signup" class="btn start">Start</a>
		<a href="/learnmore" class="btn secondary">Learn more →</a>
	</div>

	<img src={image} alt="Illustration" class="illustration" />
</section>

<style>
	.landing {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 6rem 1rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	p {
		font-size: 0.95rem;
		color: var(--color-text);
		margin-bottom: 2rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.btn {
		padding: 0.6rem 1.4rem;
		font-size: 0.85rem;
		text-decoration: none;
		transition: all 0.2s ease;
		border: 2px solid var(--color-text);
	}

	.btn.start {
		background: var(--color-primary);
		color: black;
	}
	.btn.start:hover {
		transform: translateY(-2px);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
	}

	.btn.secondary {
		background: transparent;
		color: var(--color-text);
	}
	.btn.secondary:hover {
		transform: translateX(4px);
		text-decoration: underline;
	}

	.illustration {
	max-width: 360px;
	width: 100%;
	height: auto;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	margin-top: 2rem;
	}

</style>
