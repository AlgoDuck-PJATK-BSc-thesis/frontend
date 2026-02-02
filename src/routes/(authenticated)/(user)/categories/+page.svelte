<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import type { CategoryDto } from './proxy+page';
	import type { StandardResponseDto } from '$lib/api/apiCall';
	import ToolTip from '../../(admin)/problem/upsert/ToolTip.svelte';
	  import waterBg from '$lib/images/water.png';

	let { data }: { data: StandardResponseDto<CategoryDto[]> } = $props();

	let main: HTMLElement;
	let scrollableFrame: HTMLElement;
	let categoryDivs: HTMLElement[] = $state([]);

	let scrollLeft = $state(0);
	let frameWidth = $state(0);
	let viewportWidth = $state(0);

	let maxScroll = $derived(Math.max(0, frameWidth - viewportWidth));

	let isDragging = $state(false);
	let velocity = $state(0);
	let lastMouseX = 0;
	let lastTime = 0;
	let animationId: number | null = null;

	let mouseDownPos = { x: 0, y: 0 };
	let wasClick = $state(false);
	const CLICK_THRESHOLD = 10;

	let hoveredIndex: number | null = $state(null);

	let bobOffsets: number[] = $derived(
		data.body?.map((_, i) => ((i * 17) % 10) / 10) ?? []
	);

	const clampScroll = (value: number): number => {
		return Math.max(-maxScroll, Math.min(0, value));
	};

	const setScroll = (value: number) => {
		scrollLeft = clampScroll(value);
	};

	const animateDrag = (currentTime: number) => {
		if (!isDragging) {
			animationId = null;
			return;
		}

		if (lastTime > 0) {
			const dt = (currentTime - lastTime) / 1000;
			if (dt > 0) {
				velocity = velocity * 0.8; 
			}
		}

		lastTime = currentTime;
		animationId = requestAnimationFrame(animateDrag);
	};

	const animateMomentum = () => {
		if (Math.abs(velocity) < 10) {
			animationId = null;
			return;
		}

		const delta = Math.round(velocity / 60);
		const newScroll = scrollLeft + delta;
		const clamped = clampScroll(newScroll);

		if (clamped !== newScroll) {
			scrollLeft = clamped;
			animationId = null;
			return;
		}

		scrollLeft = clamped;
		velocity *= 0.95;

		animationId = requestAnimationFrame(animateMomentum);
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (isKeyboardMode) return;
		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}

		isDragging = true;
		wasClick = true;
		velocity = 0;
		lastMouseX = e.clientX;
		lastTime = 0;
		mouseDownPos = { x: e.clientX, y: e.clientY };

		document.body.style.userSelect = 'none';
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		animationId = requestAnimationFrame(animateDrag);
	};

	const handleMouseMove = (e: MouseEvent) => {
		const dx = e.clientX - lastMouseX;
		const dt = performance.now() - lastTime;

		if (dt > 0) {
			velocity = (dx / dt) * 1000;
		}

		setScroll(scrollLeft + dx);
		lastMouseX = e.clientX;

		const totalDx = Math.abs(e.clientX - mouseDownPos.x);
		const totalDy = Math.abs(e.clientY - mouseDownPos.y);
		if (totalDx > CLICK_THRESHOLD || totalDy > CLICK_THRESHOLD) {
			wasClick = false;
		}
	};

	const handleMouseUp = () => {
		document.body.style.userSelect = '';
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		isDragging = false;

		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}

		if (Math.abs(velocity) > 50) {
			animationId = requestAnimationFrame(animateMomentum);
		}
	};

	const handleIslandClick = (categoryId: string) => {
		if (wasClick) {
			goto(`./categories/problems?categoryId=${categoryId}`);
		}
	};

	const calculateLayout = () => {
		if (!main || !categoryDivs.length || categoryDivs.some(d => !d)) return;

		const rect = main.getBoundingClientRect();
		viewportWidth = rect.width;
		const viewportHeight = rect.height;

		const islandRect = categoryDivs[0].getBoundingClientRect();
		const islandWidth = islandRect.width;
		const islandHeight = islandRect.height;

		const paddingX = islandWidth / 2;
		const paddingY = islandHeight / 2;

		frameWidth = Math.max(
			paddingX + islandWidth * 1.5 * categoryDivs.length,
			viewportWidth
		);

		const tiers = [0.25, 0.5, 0.75];
		const minY = paddingY;
		const maxY = viewportHeight - paddingY - islandHeight;

		categoryDivs.forEach((div, i) => {
			const x = paddingX + islandWidth * 1.5 * i;

			const tierIndex = i % 3;
			const tierPosition = tiers[tierIndex];
			const jitter = ((i * 7) % 5 - 2) * 8; 
			const y = minY + tierPosition * (maxY - minY) + jitter;

			div.style.setProperty('--island-x', `${x}px`);
			div.style.setProperty('--island-y', `${y}px`);
			div.style.setProperty('--bob-delay', `${bobOffsets[i]}s`);
		});

		scrollLeft = clampScroll(scrollLeft);
	};

	let initialized = false;
	const waitForImages = async (): Promise<void> => {
		const images = categoryDivs.map(div => div.querySelector('img'));
		await Promise.all(
			images.map(img => {
				if (!img) return Promise.resolve();
				if (img.complete) return Promise.resolve();
				return new Promise(resolve => {
					img.onload = resolve;
					img.onerror = resolve;
				});
			})
		);
	};

	$effect(() => {
		if (initialized) return;
		if (!main) return;
		if (categoryDivs.length !== data.body.length) return;
		if (categoryDivs.some(div => !div)) return;

		waitForImages().then(() => {
			requestAnimationFrame(() => {
				calculateLayout();
				initialized = true;
			});
		});
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter"){
			isKeyboardMode = true;
		}
		if (e.key === "Escape"){
			isKeyboardMode = false;
		}

		if (isKeyboardMode && e.key === "ArrowLeft" || e.key === "a"){
			const newScroll = scrollLeft += 100;
			scrollLeft = clampScroll(newScroll);
		}
		
		if (isKeyboardMode && e.key === "ArrowRight" || e.key === "d"){
			const newScroll = scrollLeft -= 100;
			scrollLeft = clampScroll(newScroll);
		}
	}

	let isKeyboardMode: boolean = $state(false);
	let isScrollableFrameFocused: boolean = $state(false);
	
</script>

<svelte:window onresize={calculateLayout} onkeydown={handleKeyDown}/>

<svelte:head>
	<title>Categories - Algoduck</title>
</svelte:head>

<main bind:this={main} style="image-rendering: pixelated;"
	class="relative h-full w-full overflow-hidden [image-rendering:pixelated]">
	<div class="fixed bg-black/20 top-16 z-999 font-['Press_Start_2P'] py-3 px-5 backdrop-blur-md flex flex-col rounded-br-xl">
		<span class="text-md stroke-1 island-label flex items-center gap-5">Current mode: {isKeyboardMode ? "Keyboard" : "Mouse"} <ToolTip options={{ tip: "Press 'Enter' \nand 'Esc' \nto switch modes", svgIconOpts: { class: 'w-5 h-5 stroke-black stroke-[2]' } }}/></span>
		{#if isKeyboardMode}
			<span class="text-xs island-label">Press a/&lt; and d/&gt; to move</span>
		{/if}
	</div>
	<div bind:this={scrollableFrame}
		onfocus={() => isScrollableFrameFocused = true}
		onblur={() => isScrollableFrameFocused = false}
		role="button"
		tabindex="0"
		class="scrollable-frame absolute z-10 h-full min-w-full cursor-grab bg-[length:auto_100%] bg-repeat-x active:cursor-grabbing"
		style="background-image: url('{waterBg}'); left: {scrollLeft}px; width: {frameWidth}px"		
		onmousedown={handleMouseDown}>
		<div class="relative h-full w-full">
			{#each data.body as category, i}
				<button bind:this={categoryDivs[i]}
					class="island absolute flex cursor-pointer items-center justify-center border-none bg-transparent p-0"
					class:hovered={hoveredIndex === i}
					class:dragging={isDragging}
					onmouseenter={() => hoveredIndex = i}
					onmouseleave={() => hoveredIndex = null}
					onkeydown={(e: KeyboardEvent) => {
						if (e.key === "Enter")
							goto(`./categories/problems?categoryId=${category.categoryId}`);
					}}
					onmouseup={() => handleIslandClick(category.categoryId)}>
					<div class="relative flex flex-col items-center">
						<img src={`https://d3018wbyyxg1xc.cloudfront.net/category/${category.categoryId}/Sprite.png`}
							alt="{category.categoryId} category"
							draggable="false"
							style="image-rendering: pixelated;"
							class="island-sprite select-none"/>
						<span class="island-label pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-['Press_Start_2P'] text-[10px] capitalize text-white opacity-0">
							{category.categoryName}
						</span>
					</div>
				</button>
			{/each}
		</div>
	</div>

</main>

<style>
	.scrollable-frame {
		animation: water-scroll 3s steps(4) infinite;
	}

	@keyframes water-scroll {
		to {
			background-position-x: -64px;
		}
	}

	.island {
		transform: translate(var(--island-x, 0), var(--island-y, 0));
		animation: bob 2s steps(4) infinite;
		animation-delay: var(--bob-delay, 0s);
	}

	.island.dragging {
		animation-play-state: paused;
	}

	@keyframes bob {
		0%, 100% { margin-top: 0; }
		25% { margin-top: -3px; }
		50% { margin-top: -1px; }
		75% { margin-top: -4px; }
	}

	.island-sprite {
		transition: transform 0.15s steps(3), filter 0.15s steps(2);
	}

	.island.hovered .island-sprite {
		transform: translateY(-6px);
	}

	.island-label {
		text-shadow:
			2px 0 0 #222,
			-2px 0 0 #222,
			0 2px 0 #222,
			0 -2px 0 #222;
		transition: opacity 0.1s steps(2);
	}

	.island.hovered .island-label {
		opacity: 1;
	}

</style>