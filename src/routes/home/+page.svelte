<script lang="ts">
	import lightPond from '$lib/images/ponds/Staw_jasny.png';
	import darkPond from '$lib/images/ponds/Staw_ciemny.png';
	import preview from '$lib/images/pond.jpg';
	import { goto } from '$app/navigation';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	let username = 'OrbitOwl';
	let currentSlide = 0;
	let imageHeight = 0;
	let isExpanded = false;

	const carouselItems = [
		{ title: 'Challenge 1', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
		{ title: 'Challenge 2', body: 'Phasellus iaculis, justo nec tristique tincidunt, orci lorem. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
		{ title: 'Challenge 3', body: 'Cras faucibus, lorem nec eleifend bibendum, nisi felis. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }
	];

	let theme = 'light';

onMount(() => {
	theme = document.documentElement.getAttribute('data-theme') || 'light';

	const observer = new MutationObserver(() => {
		const current = document.documentElement.getAttribute('data-theme') || 'light';
		theme = current;
	});
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});

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
	<div class="dashboard" class:is-expanded={isExpanded}>
		{#if !isExpanded}
			<div class="left-column" style="min-height: 70vh; height: {imageHeight || '70vh'}">
				<h1 class="welcome-title">Welcome back {username} </h1>
				<div class="card carousel">
					<h2>{carouselItems[$slideIndex].title}</h2>
					<div class="carousel-frame">
						<div class="carousel-controls">
							<button onclick={() => slideIndex.set((currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length))}>&lt;</button>
							<button onclick={() => slideIndex.set((currentSlide = (currentSlide + 1) % carouselItems.length))}>&gt;</button>
						</div>
						<div class="center-body">
						{#each carouselItems as item, i (i)}
							{#if i === $slideIndex}
								<p in:fly={{ x: 30, duration: 250 }} out:fly={{ x: -30, duration: 250 }}>
									{item.body}
								</p>
							{/if}
						{/each}						
						</div>
					</div>
					<div class="carousel-indicator">
						{#each carouselItems as _, i}
							<span>{i === $slideIndex ? ' ● ' : ' ○ '}</span>
						{/each}
					</div>
				</div>

				<div class="card">
					<h2>Recently Solved</h2>
					<div class="center-body">
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.</p>
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

		<div class="right-column">
			<div class="image-wrapper" class:expanded={isExpanded} bind:this={imageWrapperRef}>
				<div class="relative">
					<button
						onclick={() => isExpanded = !isExpanded}
						class="absolute top-20 right-8 bg-[var(--color-primary)] text-white rounded-md text-xs px-2 py-1 z-10">
						{isExpanded ? '›' : '‹'}
					</button>
					<img src={theme === 'dark' ? darkPond : lightPond} alt="pond" onload={updateHeight} />
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.home {
		height: fit-content;
		padding: 0 2rem;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		overflow: auto;
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
		margin-top: 2rem;
		flex-direction: column;
		gap: 1rem;
		justify-content: space-between;
		text-align: center;
		position: relative;
		overflow-y: auto;
	}

	.card {
		height: calc(100% / 3 + 500px);
		border: 2px solid var(--color-accent-1);
		border-radius: 6px;
		background: var(--color-tile);
		padding: 1rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transition: all 0.3s ease;
	}

	.card.carousel {
		position: relative;
	}

	.carousel-frame {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
	}

	.carousel-controls {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 100%;
		pointer-events: none;
	}

	.carousel-controls button {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: auto;
	font-family: var(--font-body);
	cursor: pointer;
	border: none;
	background: var(--color-primary);
	padding: 0.3rem 0.45rem;
	font-size: 0.80rem;
	color: white;
	border-radius: 6px;
	}

	.carousel-controls button:first-child {
		left: 0.01rem;
	}

	.carousel-controls button:last-child {
		right: 0.01rem;
	}

	.carousel-indicator {
		margin-top: 0.5rem;
		text-align: center;
		font-size: 0.9rem;
	}

	.carousel-indicator span {
		color: var(--color-text);
		margin: 0 2px;
	}

	.center-body {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 0 2.5rem;
		text-align: center;
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

	.right-column {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;
		gap: 0.5rem;
	}

	.image-wrapper {
		position: relative;
		border-radius: 6px;
		background: var(--color-bg);
		display: inline-block;
		width: auto;
		max-width: 100%;
		margin: 0 auto;
		transition: all 0.3s ease;
		position: relative;
		overflow: auto;

	}

	/* .expanded {
		grid-column: 1 / -1;
	} */

	.expanded {
	position: fixed;
	inset: 0;
	z-index: 50; 
	background: var(--color-bg); 
	}

	.image-wrapper img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* .inline-toggle-button {
	position: absolute;
	z-index: 10;
	top: 1rem;
	left: 1rem;
 	} */

</style>