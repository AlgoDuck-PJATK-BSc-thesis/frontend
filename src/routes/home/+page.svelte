<script lang="ts">
	import lightPond from '$lib/images/ponds/Staw_jasny.png';
	import darkPond from '$lib/images/ponds/Staw_ciemny.png';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Expand from '../components/Expand.svelte';

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

	let slideIndex = 0;
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

<section class="h-fit px-8 flex flex-col box-border overflow-auto">
	<div class={`grid items-start relative gap-8 ${isExpanded ? 'grid-cols-1' : 'grid-cols-[1fr_3fr]'}`}>
		{#if !isExpanded}
			<div
				class="flex flex-col justify-between text-center relative gap-4 mt-8 overflow-y-auto pr-1 pb-16"
				style="max-height: calc(100vh - 8rem);"
			>
				<h1 class="text-2xl text-[color:var(--color-primary)] text-center mb-2">
					Welcome back <br />{username}
				</h1>

				<div class="aspect-[8/3] min-h-[14rem] w-full border-2 border-[color:var(--color-accent-1)] rounded bg-[color:var(--color-tile)] p-4 text-center flex flex-col justify-between transition-all">
					<h2 class="text-base text-[color:var(--color-accent-2)] mb-2">{carouselItems[slideIndex].title}</h2>
					<div class="relative h-full flex flex-col justify-center">
						<div class="absolute top-1/2 -translate-y-1/2 w-full pointer-events-none">
							<button
								class="absolute left-[0.01rem] top-1/2 -translate-y-1/2 bg-[color:var(--color-primary)] text-white text-[0.8rem] px-2 py-1 rounded font-body pointer-events-auto"
					
								onclick={() =>
									slideIndex = currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length
								}
							>
								&lt;
							</button>
							<button
								class="absolute right-[0.01rem] top-1/2 -translate-y-1/2 bg-[color:var(--color-primary)] text-white text-[0.8rem] px-2 py-1 rounded font-body pointer-events-auto"

								onclick={() =>
									slideIndex = currentSlide = (currentSlide + 1) % carouselItems.length
								}
							>
								&gt;
							</button>
						</div>

						<div class="flex items-center justify-center h-full px-10 text-center">
						{#each carouselItems as item, i (i)}
							{#if i === slideIndex}
							<div
								class="max-h-[5.5rem] overflow-hidden hover:overflow-y-auto pr-1 text-[0.75rem] text-[color:var(--color-text)] m-0 transition-opacity duration-300"
								in:fly={{ duration: 200 }}
								out:fly={{ duration: 200 }}
							>
								{item.body}
							</div>
							{/if}
						{/each}
						</div>
					</div>

					<div class="mt-2 text-center text-sm">
						{#each carouselItems as _, i}
							<span class="text-[color:var(--color-text)] mx-[2px]">
								{i === slideIndex ? ' ● ' : ' ○ '}

							</span>
						{/each}
					</div>

				</div>

				<div class="aspect-[8/3] min-h-[12rem] w-full border-2 border-[color:var(--color-accent-1)] rounded bg-[color:var(--color-tile)] p-4 text-center flex flex-col justify-between transition-all">
					<h2 class="text-base text-[color:var(--color-accent-2)] mb-2">Recently Solved</h2>
					<div class="flex items-center justify-center h-full px-10 text-center">
						<p class="text-xs text-[color:var(--color-text)] m-0 max-h-[5rem] overflow-hidden hover:overflow-y-auto pr-1">

						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.</p>
					</div>
				</div>

				<div class="aspect-[8/3] min-h-[12rem] w-full border-2 border-[color:var(--color-accent-1)] rounded bg-[color:var(--color-tile)] p-4 text-center flex flex-col justify-between transition-all">
					<h2 class="text-base text-[color:var(--color-accent-2)] mb-2">Stats</h2>
					<div class="flex items-center justify-center h-full px-10 text-center">
						<p class="text-xs text-[color:var(--color-text)] m-0 max-h-[5rem] overflow-hidden hover:overflow-y-auto pr-1">

							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="flex flex-col items-stretch justify-start gap-2">
			<div
				class={`relative rounded bg-[color:var(--color-bg)] inline-block w-auto max-w-full mx-auto transition-all overflow-auto ${
					isExpanded ? 'fixed inset-0 z-[50] bg-[color:var(--color-bg)]' : ''
				}`}
				bind:this={imageWrapperRef}
			>
				<div class="relative">
					<!-- <button
						onclick={() => (isExpanded = !isExpanded)}
						class="fixed top-20 right-8 bg-[color:var(--color-primary)] text-white rounded-md text-xs px-2 py-1 z-50"
					>
						{isExpanded ? '›' : '‹'}
					</button> -->
	
					<Expand
						expanded={isExpanded}
						ontoggle={() => (isExpanded = !isExpanded)}
					/>
					
					<img
						src={theme === 'dark' ? darkPond : lightPond}
						alt="pond"
						onload={updateHeight}
						class={`block object-contain mx-auto ${
							isExpanded
								? 'h-[calc(100vh-10rem)] w-auto max-w-full'
								: 'h-[calc(100vh-15rem)] w-auto max-w-full mt-16'
						}`}
					/>
				</div>
			</div>
		</div>
	</div>
</section>
