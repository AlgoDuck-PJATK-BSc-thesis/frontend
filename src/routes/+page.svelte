<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../Components/ButtonComponents/Button.svelte';

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

<section class="relative h-[calc(100vh-6rem)] w-full overflow-hidden">
	<img
		src={background2}
		alt="water static"
		class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
	/>

	<img
		src={background1}
		alt="water drift"
		class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-[150ms]"
		style={`transform: translate(${offsetX}px, ${offsetY}px);`}
	/>

	<img
		src={islandVisible}
		alt="island"
		class="pointer-events-none absolute top-1/2 left-1/2 z-10 h-auto w-140 -translate-x-1/2 -translate-y-1/5 transition-opacity duration-500"
	/>

	<div class="relative z-20 flex flex-col items-center px-4 py-24 text-center">
		<h1
			class="mb-4 text-5xl font-bold tracking-wide text-[color:var(--color-white)]"
			style="font-family: var(--font-ariw9500);"
		>
			BEETCODE
		</h1>

		<p class="mb-6 text-2xl font-bold text-white">
			Transform your coding skills, one problem at a time
		</p>

		<div class="mb-8 flex gap-4">
			<Button
				size="small"
				label="Start"
				labelColor="[color:var(--color-text-button)]"
				labelFontSize="1rem"
				labelFontFamily="var(--font-ariw9500)"
				labelFontWeight="normal"
				onclick={() => (window.location.href = '/signup')}
			/>

			<Button
				size="medium"
				label="Learn More"
				labelColor="[color:var(--color-text-button)]"
				labelFontSize="1rem"
				labelFontFamily="var(--font-ariw9500)"
				labelFontWeight="normal"
				onclick={() => (window.location.href = '/learnmore')}
			/>
		</div>
	</div>
</section>
