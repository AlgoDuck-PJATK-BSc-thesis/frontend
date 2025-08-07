<script lang="ts">
	import { onMount } from 'svelte';

	import background1 from '$lib/images/ponds/Textura_wody1.png';
	import background2 from '$lib/images/ponds/Textura_wody2.png';

	import island1 from '$lib/images/ponds/Wysepka1.png';
	import island2 from '$lib/images/ponds/Wysepka2.png';

	let islandFrame = 0;
	let islandInterval: number;

	let offsetX = 0;
	let offsetY = 0;
	let animationFrame: number;

	function animateWater() {
		offsetX += 0.15;
		offsetY += 0.3;

		if (offsetX > 8) offsetX = 0;
		if (offsetY > 8) offsetY = 0;

		animationFrame = requestAnimationFrame(animateWater);
	}

	onMount(() => {

		animateWater();

		islandInterval = setInterval(() => {
			islandFrame = (islandFrame + 1) % 2;
		}, 600);

		return () => {
			cancelAnimationFrame(animationFrame);
			clearInterval(islandInterval);
		};
	});

	$: islandVisible = islandFrame === 0 ? island1 : island2;
</script>

<section class="relative w-full h-[calc(100vh-6rem)] overflow-hidden">
	<img
		src={background2}
		alt="water static"
		class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
	/>

	<img
		src={background1}
		alt="water drift"
		class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none transition-transform duration-[150ms]"
		style={`transform: translate(${offsetX}px, ${offsetY}px);`}
	/>

	<img
		src={islandVisible}
		alt="island"
		class="absolute w-150 h-auto z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 pointer-events-none transition-opacity duration-500"
	/>

	<div class="relative z-20 flex flex-col items-center text-center px-4 py-24">
		<h1 class="text-4xl text-[color:var(--color-primary)] font-bold mb-4">BEETCODE</h1>
		<p class="text-[0.95rem] text-[color:var(--color-text)] mb-8">
			Transform your coding skills, one problem at a time
		</p>
		<div class="flex gap-4 mb-8">
			<a
				href="/signup"
				class="px-5 py-[0.6rem] text-sm no-underline border-2 border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-bg)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 rounded-lg"
			>
				Start
			</a>
			<a
				href="/learnmore"
				class="px-5 py-[0.6rem] text-sm no-underline border-2 border-[color:var(--color-text)] text-[color:var(--color-text)] bg-transparent hover:underline hover:translate-x-1 transition-all duration-200 rounded-lg"
			>
				Learn more →
			</a>
		</div>
	</div>
</section>