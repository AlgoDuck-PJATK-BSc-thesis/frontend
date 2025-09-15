<script lang="ts" generics="T1 extends {}, T2 extends {}">
	import { onMount, type Component } from 'svelte';
	import type { ComponentConfig } from '../Settings/Types/ComponentConfig';

	let {
		top,
		bottom,
		initialTop
	}: { top: ComponentConfig<T1>; bottom: ComponentConfig<T2>; initialTop: number } = $props();

	let initialBottom: number = $derived(1 - initialTop);

	let container: HTMLDivElement;
	let topProportion = $state(initialTop);
	// svelte-ignore state_referenced_locally
	let bottomProportion = $state(initialBottom);

	let isDragging = false;
	let lastMouseY: number | null = null;
	let isHovered = $state(false);

	const TopComponent: Component<{ options: T1 }> = top.component;
	const BottomComponent: Component<{ options: T2 }> = bottom.component;

	const handleMouseDown = () => {
		isDragging = true;
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.body.style.cursor = 'row-resize';
		document.body.style.userSelect = 'none';
	};

	const handleMouseUp = () => {
		isDragging = false;
		isHovered = false;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		lastMouseY = null;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		if (lastMouseY !== null) {
			const containerHeight = container.clientHeight;
			const dy = e.clientY - lastMouseY;
			const delta = dy / containerHeight;

			topProportion += delta;
			bottomProportion -= delta;
		}
		lastMouseY = e.clientY;
	};

	onMount(() => {
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<div bind:this={container} class="h-full flex flex-col">
	<div class="w-full rounded-xl" style="flex: {topProportion}">
		<TopComponent options={top.options} />
	</div>

	<button
		onmousedown={handleMouseDown}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => {
			if (!isDragging) isHovered = false;
		}}
		class="w-full h-2.5 bg-transparent flex-shrink-0 flex-grow-0 flex justify-center items-center"
		aria-label="vertical-resize-bar"
	>
		{#if isHovered}
			<div class="w-full h-[30%] bg-blue-600 rounded-full"></div>
		{:else}
			<div class="w-[5%] h-[30%] bg-gray-600 rounded-full"></div>
		{/if}
	</button>

	<div class="w-full rounded-xl" style="flex: {bottomProportion}">
		<BottomComponent options={bottom.options} />
	</div>
</div>
