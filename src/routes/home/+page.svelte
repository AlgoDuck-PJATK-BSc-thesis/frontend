<script lang="ts">
	import { onMount } from 'svelte';
	import HelperDuck from '$lib/Components/LayoutComponents/HelperDuck.svelte';

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

	let reduceMotion = false;

	if (typeof window !== 'undefined') {
		reduceMotion = document.documentElement.dataset.reduceMotion === 'true';
	}

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
	<title>Home – AlgoDuck</title>
</svelte:head>

<section
	class="box-border flex h-fit flex-col overflow-auto bg-[color:var(--color-grass-green)] px-10"
>
	<div class="flex flex-col items-stretch justify-start gap-2">
		<div
			class={`relative mx-auto inline-block max-h-[calc(100vh-4rem)] w-auto max-w-[calc(100vw-2rem)] overflow-auto transition-all`}
		>
			<HelperDuck mode="home" />

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
