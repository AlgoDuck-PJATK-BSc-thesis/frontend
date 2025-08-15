<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import type { SpringOptions } from 'motion';

	type ThemeType = 'light' | 'dark';

	export let ontoggle: () => void;
	export let imagesPath = '/buttons';

	let path1: SVGPathElement;
	let path2: SVGPathElement;
	let path3: SVGPathElement;
	let path4: SVGPathElement;

	let currentTheme: ThemeType = 'light';
	let isAnimated = false;

	let restPath: string;
	let hoverPath: string;

	const transition: SpringOptions = {
		stiffness: 400,
		damping: 20
	};

	const keyframes = [
		{ pathLength: [0, 1], opacity: [0, 1] },
		{ pathLength: [0, 1], opacity: [0, 1] },
		{ pathLength: [0, 1], opacity: [0, 1] },
		{ pathLength: [0, 1], opacity: [0, 1] }
	];

	function triggerAnimation() {
		const targets = [path1, path2, path3, path4];
		targets.forEach((path, i) => {
			animate(path, keyframes[i], {
				...transition,
				delay: 0.1 * i
			});
		});
		isAnimated = true;
		ontoggle?.();
	}

	$: restPath = (() => {
		const color = currentTheme === 'light' ? 'Jasny' : 'Ciemny';
		return `${imagesPath}/${currentTheme}/square/${color}_guzik_kwadratowy1.png`;
	})();

	$: hoverPath = (() => {
		const color = currentTheme === 'light' ? 'Jasny' : 'Ciemny';
		return `${imagesPath}/${currentTheme}/square/${color}_guzik_kwadratowy2.png`;
	})();

	onMount(() => {
		currentTheme = (document.documentElement.getAttribute('data-theme') as ThemeType) || 'light';

		const observer = new MutationObserver(() => {
			const themeAttr = document.documentElement.getAttribute('data-theme') as ThemeType;
			currentTheme = themeAttr || 'light';
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => observer.disconnect();
	});
</script>

<button
	onclick={triggerAnimation}
	aria-label="Accessibility options"
	aria-pressed={isAnimated}
	title="Accessibility options"
	class="group fixed right-7 bottom-14 z-[999] border-none bg-transparent p-0"
>
	<img
		src={restPath}
		alt=""
		class="pointer-events-none opacity-100 transition-opacity duration-100 group-hover:opacity-0"
		draggable="false"
	/>

	<img
		src={hoverPath}
		alt=""
		class="pointer-events-none absolute bottom-0 left-0 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
		draggable="false"
	/>

	<span
		class="pointer-events-none absolute inset-0 z-10 flex translate-y-[-2px] items-center justify-center transition-transform duration-100 group-hover:translate-y-[2px]"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="28"
			height="28"
			viewBox="0 0 24 24"
			fill="none"
			class="text-[color:var(--color-text-button)]"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				bind:this={path1}
				d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
			/>
			<path
				bind:this={path2}
				d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"
			/>
			<path bind:this={path3} d="m18 15-2-2" />
			<path bind:this={path4} d="m15 18-2-2" />
		</svg>
	</span>
</button>
