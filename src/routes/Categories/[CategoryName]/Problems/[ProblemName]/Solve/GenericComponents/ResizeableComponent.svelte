<script lang="ts" generics="T1 extends {}, T2 extends {}">
	import { onMount, type Component } from 'svelte';
	import type { ResizeableComponentArg } from './ResizeableComponentArg';

	let { options }: { options: ResizeableComponentArg<T1, T2> } = $props();

	let initialComp2Proportions: number = 1 - options.initialComp1Proportions;

	let mainContainer: HTMLDivElement;
	let comp1Proportion = $state(options.initialComp1Proportions);
	let comp2Proportion = $state(initialComp2Proportions);

	let isDragging = false;
	let lastMouseP: number | null = null;
	let isResizeBarHovered = $state(false);

	const Component1: Component<{ options: T1 }> = options.comp1.component;
	const Component2: Component<{ options: T2 }> = options.comp2.component;

	const handleMouseDown = () => {
		isDragging = true;
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.body.style.cursor = options.axis === 0 ? 'col-resize' : 'row-resize';
		document.body.style.userSelect = 'none';
	};

	const handleMouseUp = () => {
		isDragging = false;
		isResizeBarHovered = false;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		lastMouseP = null;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		if (lastMouseP !== null) {
			const containerDim = getClientDim(mainContainer);
			const dp = getClientP(e) - lastMouseP;
			const delta = dp / containerDim;

			comp1Proportion += delta;
			comp2Proportion -= delta;
		}
		lastMouseP = getClientP(e);
	};

	const getClientDim = (clientContainer: HTMLDivElement): number => {
		return options.axis === 0 ? clientContainer.clientWidth : clientContainer.clientHeight;
	}

	const getClientP = (e: MouseEvent): number =>{
		return options.axis === 0 ? e.clientX : e.clientY;
	}

	onMount(() => {
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<div bind:this={mainContainer} class="h-full flex {options.axis === 0 ? '' : 'flex-col'}">
	<div class="{options.axis === 0 ? 'h-full' : 'w-full'} rounded-xl overflow-hidden" style="flex: {comp1Proportion}">
		<Component1 options={options.comp1.options} />
	</div>

	<button
		onmousedown={handleMouseDown}
		onmouseenter={() => (isResizeBarHovered = true)}
		onmouseleave={() => {
			if (!isDragging) isResizeBarHovered = false;
		}}
		class="{options.axis === 0 ? 'h-full w-2.5' : 'w-full h-2.5'} bg-transparent flex-shrink-0 flex-grow-0 flex justify-center items-center"
		aria-label="resize-bar"
	>
		{#if isResizeBarHovered}
			<div class="{options.axis === 0 ? 'h-full w-[30%]' : 'w-full h-[30%]'} bg-blue-600 rounded-full"></div>
		{:else}
			<div class="{options.axis === 0 ? 'w-[30%] h-[5%]' : 'w-[5%] h-[30%]'} bg-gray-600 rounded-full"></div>
		{/if}
	</button>

	<div class="{options.axis === 0 ? 'h-full' : 'w-full'} rounded-xl overflow-hidden" style="flex: {comp2Proportion}">
		<Component2 options={options.comp2.options} />
	</div>
</div>
