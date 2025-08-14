<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Expand from '../../Components/LayoutComponents/Expand.svelte';

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
		{
			title: 'Task 1',
			body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		},
		{
			title: 'Task 2',
			body: 'Phasellus iaculis, justo nec tristique tincidunt, orci lorem. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
		},
		{
			title: 'Task 3',
			body: 'Cras faucibus, lorem nec eleifend bibendum, nisi felis. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
		}
	];

	let theme = 'light';

	onMount(() => {
		theme = document.documentElement.getAttribute('data-theme') || 'light';

		const observer = new MutationObserver(() => {
			const current = document.documentElement.getAttribute('data-theme') || 'light';
			theme = current;
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
	});

	let slideIndex = 0;
	let imageWrapperRef: HTMLDivElement;

	const problemCategories = [
		'array problems',
		'loop problems',
		'string manipulation',
		'graph traversal',
		'tree problems',
		'sorting algorithms',
		'dynamic programming',
		'bit manipulation',
		'greedy algorithms'
	];

	let currentCategory = problemCategories[Math.floor(Math.random() * problemCategories.length)];

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
		anakin,
		cowboy,
		detective,
		knight,
		mallard,
		mermaid,
		miku,
		ninja,
		pirate,
		princess,
		samurai,
		viking,
		witch
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
			ducks = ducks.map((duck) => ({
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

<section
	class="box-border flex h-fit flex-col overflow-auto bg-[color:var(--color-grass-green)] px-10"
>
	<div class="flex flex-col items-stretch justify-start gap-2">
		<div
			class={`relative mx-auto inline-block max-h-[calc(100vh-4rem)] w-auto max-w-[calc(100vw-2rem)] overflow-auto transition-all`}
		>
			<div class="relative mt-8 h-28">
				<div class="absolute top-0 left-1/2 flex -translate-x-[160px] items-center gap-4">
					<div class="relative">
						<button
							class="mr-2 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-[color:var(--color-primary)] p-0 shadow-md"
							style="aspect-ratio: 1 / 1;"
						>
							<img
								src={duck}
								alt="duck"
								class="h-full w-full -translate-x-[-15%] -translate-y-[-10%] scale-[1.5] object-cover object-[left_top]"
							/>
						</button>

						<p class="mt-1 text-sm font-semibold text-[color:var(--color-white)]">Helper Duck</p>

						<div
							class="absolute top-1/2 left-full ml-3 w-max max-w-[350px] -translate-y-1/2 rounded-lg bg-white px-4 py-2 whitespace-normal text-black shadow
			after:absolute after:top-1/2 after:-left-2 after:-translate-y-1/2 after:border-[8px] after:border-transparent after:border-r-white after:content-['']"
						>
							<div
								class="absolute top-1/2 left-0 h-0 w-0
			-translate-x-full -translate-y-1/2 border-y-[6px] border-r-[8px] border-y-transparent border-r-white"
							></div>
							Hey!<br />
							Let's solve some {currentCategory} today
						</div>
					</div>
				</div>
			</div>

			<div class="relative">
				{#each ducks as duck (duck.id)}
					<img
						src={duck.img}
						alt="duck"
						class="pointer-events-none absolute w-[7rem] transition-all duration-1000 ease-in-out"
						style="top: {duck.y}%; left: {duck.x}%;"
					/>
				{/each}

				<img
					src={pondSrc}
					alt="pond"
					class={`mx-auto block h-[calc(100vh-13rem)] w-auto max-w-full object-contain `}
				/>
			</div>
		</div>
	</div>
</section>
