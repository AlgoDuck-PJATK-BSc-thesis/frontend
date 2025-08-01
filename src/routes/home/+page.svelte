<script lang="ts">
	
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Expand from '../../Components/Expand.svelte';

	import lightPond from '$lib/images/ponds/Staw_jasny.png';
	import darkPond from '$lib/images/ponds/Staw_ciemny.png';

	import lightPond1 from '$lib/images/ponds/JasnyStaw_1_2.png';
	import lightPond2 from '$lib/images/ponds/JasnyStaw_2_2.png';

	import darkPond1 from '$lib/images/ponds/StawCiemny_1_2.png';
	import darkPond2 from '$lib/images/ponds/StawCiemny_2_2.png';

	
	import duck from '$lib/images/ducks/duck.png';
	import ghost from '$lib/images/ducks/ghost.png';
	import anakin from '$lib/images/ducks/anakin.png';
	import cowboy from '$lib/images/ducks/cowboy.png';
	import detective from '$lib/images/ducks/detective.png';
	import knight from '$lib/images/ducks/knight.png';
	import mallard from '$lib/images/ducks/mallard.png';
	import mermaid from '$lib/images/ducks/mermaid.png';
	import miku from '$lib/images/ducks/miku.png';
	import ninja from '$lib/images/ducks/ninja.png';
	import pirate from '$lib/images/ducks/pirate.png';
	import princess from '$lib/images/ducks/princess.png';
	import samurai from '$lib/images/ducks/samurai.png';
	import viking from '$lib/images/ducks/viking.png';
	import witch from '$lib/images/ducks/witch.png';

	let username = 'OrbitOwl';
	let currentSlide = 0;
	let imageHeight = 0;
	let isExpanded = false;
	let reduceMotion = false;

	if (typeof window !== 'undefined') {
		reduceMotion = document.documentElement.dataset.reduceMotion === 'true';
	}

	const carouselItems = [
		{ title: 'Task 1', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
		{ title: 'Task 2', body: 'Phasellus iaculis, justo nec tristique tincidunt, orci lorem. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
		{ title: 'Task 3', body: 'Cras faucibus, lorem nec eleifend bibendum, nisi felis. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }
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

	// stuff for pond, the 2 frames water moving animation version

	let frame = 0;

	let pondInterval: number;

	onMount(() => {
		pondInterval = setInterval(() => {
			frame = frame === 0 ? 1 : 0;
		}, 500);

		return () => clearInterval(pondInterval);
	});

	$: pondSrc =
		theme === 'dark'
			? frame === 0
				? darkPond1
				: darkPond2
			: frame === 0
				? lightPond1
				: lightPond2;

	//experimental duck stuff
	const duckImages = [
		anakin, cowboy, detective, knight, mallard,
		mermaid, miku, ninja, pirate, princess, samurai, viking, witch
	];

	type Duck = {
		id: number;
		x: number;
		y: number;
		img: string;
	};

	let ducks: Duck[] = [];

	onMount(() => {
		const shuffled = [...duckImages].sort(() => Math.random() - 0.5);
		ducks = shuffled.slice(0, 10).map((img, i) => ({
			id: i,
			x: Math.random() * 45 + 15,
			y: Math.random() * 45 + 15,
			img
		}));

		startDuckMovement();
	});

	function startDuckMovement() {
		setInterval(() => {
			ducks = ducks.map(duck => ({
				...duck,
				x: Math.random() * 60 + 10,
				y: Math.random() * 45 + 10
			}));
		}, 2200);
	}

</script>

<svelte:head>
	<title>Home – Beetcode</title>
</svelte:head>

<section class="h-fit px-10 flex flex-col box-border overflow-auto">
	<div class={`grid items-start relative ${isExpanded ? 'grid-cols-1' : 'grid-cols-[1fr_3fr]'}`}>
		{#if !isExpanded}
			<div
				class="flex flex-col justify-between text-center relative gap-4 overflow-y-auto pr-1 pb-1"
				style="max-height: calc(100vh - 7.5rem);"
			>
				<h1 class="text-5xl text-[color:var(--color-primary)] text-center mb-2 mt-4 leading-[1.2]"
				style="font-family: var(--font-ariw9500);">
					Welcome back <br />{username}
				</h1>

				<div class="aspect-[2/1] min-h-[14rem] w-full border-2 border-[color:var(--color-accent-1)] rounded-xl bg-[color:var(--color-tile)] p-4 text-center flex flex-col justify-between transition-all">
					<h2 
					class="text-2xl text-[color:var(--color-accent-2)]"
					>
					{carouselItems[slideIndex].title}</h2>
					<div class="relative h-full flex flex-col justify-center">
						<div class="absolute top-1/2 -translate-y-1/2 w-full pointer-events-none">
							<button
								class="absolute left-[0.01rem] top-1/2 -translate-y-2/2 bg-[color:var(--color-primary)] text-white text-[0.8rem] px-2 py-1 rounded font-body pointer-events-auto"
					
								onclick={() =>
									slideIndex = currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length
								}
							>
								&lt;
							</button>
							<button
								class="absolute right-[0.01rem] top-1/2 -translate-y-2/2 bg-[color:var(--color-primary)] text-white text-[0.8rem] px-2 py-1 rounded font-body pointer-events-auto"

								onclick={() =>
									slideIndex = currentSlide = (currentSlide + 1) % carouselItems.length
								}
							>
								&gt;
							</button>
						</div>

						<div class="flex items-left justify-center h-full pt-2 pr-10 pb-6 pl-10 text-left">
						{#each carouselItems as item, i (i)}
							{#if i === slideIndex}
							<div
								class="max-h-[7.5rem] overflow-hidden hover:overflow-y-auto pr-1 text-[1rem] text-[color:var(--color-text)] ml-4 mr-4 mt-1  transition-opacity duration-300"
								style="font-family: var(--font-newmonzane);"
								in:fly={!reduceMotion ? { duration: 200 } : undefined}
								out:fly={!reduceMotion ? { duration: 200 } : undefined}
							>
								{item.body}
							</div>
							{/if}
						{/each}
						</div>
					</div>

					<!-- <div class="mt-2 text-center text-sm">
						{#each carouselItems as _, i}
							<span class="text-[color:var(--color-text)] mx-[2px]">
								{i === slideIndex ? ' ● ' : ' ○ '}

							</span>
						{/each}
					</div> -->

				</div>

				<div class="aspect-[2/3] min-h-[14rem] w-full border-2 border-[color:var(--color-accent-1)] rounded-xl bg-[color:var(--color-tile)] p-4 text-center flex flex-col justify-between transition-all">
					<h2 class="text-2xl text-[color:var(--color-accent-2)] ">Stats</h2>
					<div class="flex items-center justify-center h-full px-8 text-left">
						<p class="text-[1rem] text-[color:var(--color-text)] max-h-[7.5rem] overflow-hidden hover:overflow-y-auto "
						style="font-family: var(--font-newmonzane);">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.</p>
					</div>
				</div>

 
				<div class="aspect-[2/3] min-h-[14rem] w-full border-2 border-[color:var(--color-accent-1)] rounded-xl bg-[color:var(--color-tile)] p-4 text-center flex flex-col justify-between transition-all">
					<h2 class="text-2xl text-[color:var(--color-accent-2)] ">Recently solved</h2>
					<div class="flex items-center justify-center h-full px-8 text-left">
						<p class="text-[1rem] text-[color:var(--color-text)] max-h-[7.5rem] overflow-hidden hover:overflow-y-auto "
						style="font-family: var(--font-newmonzane);">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="flex flex-col items-stretch justify-start gap-2">
			<div
				class={`relative inline-block w-auto max-w-full mx-auto transition-all overflow-auto
				${isExpanded 
					? 'fixed inset-0 z-[50] bg-[color:var(--color-bg)]' 
					: 'max-h-[calc(100vh-6.5rem)] max-w-[calc(100vw-2rem)]'}
				`}
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

					{#each ducks as duck (duck.id)}
						<img
							src={duck.img}
							alt="duck"
							class="absolute w-[7rem] transition-all duration-1000 ease-in-out pointer-events-none"
							style="top: {duck.y}%; left: {duck.x}%;"
						/>
					{/each}

					<img
						src={pondSrc}
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
