<script lang="ts" generics="T1 extends {}, T2 extends {}">
	import { onMount, type Component } from 'svelte';
	import type { ComponentConfig } from '../Settings/Types/ComponentConfig';

	let {
		left,
		right,
		initialLeft
	}: {
		left: ComponentConfig<T1>;
		right: ComponentConfig<T2>;
		initialLeft: number;
	} = $props();

	let initalRight: number = $derived(1 - initialLeft);

	let container: HTMLDivElement;
	let leftProportion = $state(initialLeft);
	// svelte-ignore state_referenced_locally
	let rightProportion = $state(initalRight);

	let isDragging = false;
	let lastMouseX: number | null = null;
	let isHovered = $state(false);

	const LeftComponent: Component<{ options: T1 }> = left.component;
	const RightComponent: Component<{ options: T2 }> = right.component;

	const handleMouseDown = () => {
		isDragging = true;
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	};

	const handleMouseUp = () => {
		isDragging = false;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		lastMouseX = null;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		if (lastMouseX !== null) {
			const containerWidth = container.clientWidth;
			const dx = e.clientX - lastMouseX;
			const delta = dx / containerWidth;

			leftProportion += delta;
			rightProportion -= delta;
		}
		lastMouseX = e.clientX;
	};

	onMount(() => {
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<div bind:this={container} class="h-full flex flex-grow">
	<div class="h-full rounded-xl" style="flex: {leftProportion}">
		<LeftComponent options={left.options} />
	</div>

	<button
		onmousedown={handleMouseDown}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => {
			if (!isDragging) isHovered = false;
		}}
		class="h-full w-2.5 bg-transparent flex justify-center items-center"
		aria-label="horizontal-resize-bar"
	>
		{#if isHovered}
			<div class="w-[30%] h-full bg-blue-600 rounded-full"></div>
		{:else}
			<div class="w-[30%] h-[5%] bg-gray-600 rounded-full"></div>
		{/if}
	</button>

	<div class="h-full flex flex-col" style="flex: {rightProportion}">
		<RightComponent options={right.options} />
	</div>
</div>
