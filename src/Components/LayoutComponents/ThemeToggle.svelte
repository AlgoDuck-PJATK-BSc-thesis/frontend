<script lang="ts">
	import { userPreferences } from '../../Stores/theme';
	import { onMount } from 'svelte';

	let current: 'light' | 'dark' = 'light';
	let isAnimating = false;
	let frame = 0;
	let interval: number;

	const totalFrames = 11;

	const allFrames = Array.from(
		{ length: totalFrames },
		(_, i) => `/ThemeSwitch1/yellow ver MERGED - ${i + 1}.png`
	);
	const lightToDarkFrames = [...allFrames].reverse();
	const darkToLightFrames = [...allFrames];

	let frameList: string[] = darkToLightFrames;

	onMount(() => {
		if (typeof window !== 'undefined') {
			current =
				(document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
		}
	});

	function toggleTheme() {
		if (isAnimating) return;

		const htmlTheme =
			(document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
		const isCurrentlyLight = htmlTheme === 'light';

		frameList = isCurrentlyLight ? lightToDarkFrames : darkToLightFrames;

		isAnimating = true;
		frame = 0;

		interval = setInterval(() => {
			frame += 1;

			if (frame >= totalFrames) {
				clearInterval(interval);
				isAnimating = false;
				current = isCurrentlyLight ? 'dark' : 'light';
				document.documentElement.setAttribute('data-theme', current);
				userPreferences.set({ theme: current });
			}
		}, 50);
	}
</script>

<button
	onclick={toggleTheme}
	aria-label="Toggle theme"
	class="theme-toggle-button -top-[7px] cursor-pointer border-none bg-transparent"
>
	{#if isAnimating}
		<img class="frame-img" src={frameList[frame]} alt="theme animation" />
	{:else}
		<img
			class="frame-img"
			src={current === 'light'
				? '/ThemeSwitch1/yellow ver MERGED - 11.png'
				: '/ThemeSwitch1/yellow ver MERGED - 1.png'}
			alt={current + ' theme'}
		/>
	{/if}
</button>

<style>
	.theme-toggle-button {
		width: 4.5rem;
		height: 2.5rem;
		position: relative;
		overflow: hidden;
	}

	.frame-img {
		width: 4.5rem;
		height: 2.5rem;
		object-fit: contain;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		max-width: none;
		max-height: none;
	}
</style>
