<script lang="ts">
	import preview from '$lib/images/pond.jpg';
	import { goto } from '$app/navigation';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let currentSlide = 0;
	let imageHeight = 0;
	let isExpanded = false;

	const carouselItems = [
		{ title: 'Challenge 1', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
		{ title: 'Challenge 2', body: 'Phasellus iaculis, justo nec tristique tincidunt, orci lorem. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
		{ title: 'Challenge 3', body: 'Cras faucibus, lorem nec eleifend bibendum, nisi felis. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }
	];

	const slideIndex = tweened(0, { duration: 300, easing: cubicOut });
	let imageWrapperRef: HTMLDivElement;

	function updateHeight() {
		if (imageWrapperRef) {
			imageHeight = imageWrapperRef.clientHeight;
		}
	}
</script>

<svelte:head>
	<title>Home – Beetcode</title>
</svelte:head>

<section class="home">
	<h1>Welcome back @username</h1>

	<div class="dashboard" class:is-expanded={isExpanded}>
		{#if !isExpanded}
			<div class="left-column" style="height: {imageHeight}px">
				<div class="spacer"></div>
				<div class="card">
					<h2>Recently Solved</h2>
					<div class="center-body">
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.</p>
					</div>
				</div>

				<div class="card carousel">
					<h2>{carouselItems[$slideIndex].title}</h2>
					<div class="center-body">
						<p>{carouselItems[$slideIndex].body}</p>
					</div>
					<div class="carousel-controls">
						<button on:click={() => slideIndex.set((currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length))}>←</button>
						<button on:click={() => slideIndex.set((currentSlide = (currentSlide + 1) % carouselItems.length))}>→</button>
					</div>
				</div>

				<div class="card">
					<h2>Stats</h2>
					<div class="center-body">
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</p>
					</div>
				</div>
			</div>
		{/if}

		{#if isExpanded}
			<div class="collapse-button">
				<button on:click={() => isExpanded = false}>›</button>
			</div>
		{/if}

		<div class="right-column">
			<div class="image-controls right-align">
				<button on:click={() => isExpanded = !isExpanded}>{isExpanded ? '🔽 Minimize' : '🔼 Expand'}</button>
				<button on:click={() => goto('/store')}>🛒 Store</button>
			</div>
			<div class="image-wrapper" class:expanded={isExpanded} bind:this={imageWrapperRef}>
				<img src={preview} alt="preview" on:load={updateHeight} />
			</div>
		</div>
	</div>
</section>

<style>
	.home {
		height: calc(100vh - 6rem);
		padding: 1rem 2rem;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		overflow: hidden;
	}

	h1 {
		font-size: 1.5rem;
		color: var(--color-primary);
		text-align: center;
		margin-bottom: 0.5rem;
	}

	.dashboard {
		display: grid;
		grid-template-columns: 1fr 3fr;
		gap: 2rem;
		align-items: start;
		position: relative;
	}

	.dashboard.is-expanded {
		grid-template-columns: 1fr;
	}

	.left-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		justify-content: space-between;
		text-align: center;
	}

	.spacer {
		height: 2rem;
	}

	.card {
		border: 2px solid var(--color-accent-1);
		border-radius: 6px;
		background: var(--color-tile);
		padding: 1rem;
		text-align: center;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transition: all 0.3s ease;
	}

	.center-body {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	.card h2 {
		font-size: 1rem;
		color: var(--color-accent-2);
		margin-bottom: 0.5rem;
	}

	.card p {
		font-size: 0.75rem;
		color: var(--color-text);
		margin: 0;
	}

	.carousel-controls {
		display: flex;
		justify-content: space-between;
		margin-top: 0.5rem;
		gap: 0.5rem;
	}

	.carousel-controls button {
		font-family: var(--font-body);
		cursor: pointer;
		border: none;
		background: var(--color-primary);
		padding: 0.2rem 0.6rem;
		font-size: 0.75rem;
		color: black;
	}

	.right-column {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;
		gap: 0.5rem;
	}

	.image-controls {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.image-controls.right-align {
		justify-content: flex-end;
	}

	.image-controls button {
		font-family: var(--font-body);
		font-size: 0.65rem;
		padding: 0.3rem 0.6rem;
		background: var(--color-primary);
		border: none;
		cursor: pointer;
		color: black;
	}

	.image-wrapper {
		border: 2px solid var(--color-accent-1);
		border-radius: 6px;
		background: var(--color-tile);
		display: inline-block;
		width: auto;
		max-width: 100%;
		margin: 0 auto;
		transition: all 0.3s ease;
	}

	.expanded {
		grid-column: 1 / -1;
	}

	.image-wrapper img {
		display: block;
		width: auto;
		height: 100%;
		object-fit: contain;
	}

	.collapse-button {
		position: absolute;
		top: 50%;
		left: 0;
		transform: translateX(-50%) translateY(-50%);
		background: var(--color-primary);
		border-radius: 0 6px 6px 0;
		padding: 0.5rem;
		z-index: 10;
	}

	.collapse-button button {
		font-family: var(--font-body);
		background: var(--color-primary);
		border: none;
		padding: 0.2rem 0.6rem;
		cursor: pointer;
		font-size: 1rem;
		color: white;
	}
</style>