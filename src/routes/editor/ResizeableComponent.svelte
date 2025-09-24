<script lang="ts" generics="T1 extends ComponentConfig<any>, T2 extends ComponentConfig<any>">
	import { onMount, type Component } from 'svelte';
  import type { ComponentConfig, ResizeableComponentArg } from './ResizableComponentArg';
  import { ComponentRegistry } from './ComponentRegistry';
  
  let { options = $bindable() }: { options: ResizeableComponentArg<T1, T2> } = $props();
  
  let initialComp2Proportions: number = $derived(options ? 1 - options.initialComp1Proportions : 0.5);
  let mainContainer: HTMLDivElement | undefined = $state();

	// svelte-ignore state_referenced_locally
	// I know what I'm doing
	let comp2Proportion = $state(initialComp2Proportions);

  let isDragging = false;
  let lastMouseP: number | null = null;
  let isResizeBarHovered = $state(false);
  
  const comp1Config: ComponentConfig<T1> | undefined = $derived(options?.comp1);
  const comp2Config: ComponentConfig<T2> | undefined = $derived(options?.comp2);
  
  let comp1Options: T1 | undefined = $derived(comp1Config?.options);
  let comp2Options: T2 | undefined = $derived(comp2Config?.options);
  
  let Component1: Component<{ options: T1 }> | undefined = $derived(
    comp1Config ? ComponentRegistry.get(comp1Config.component) as Component<{ options: T1 }> : undefined
  );
	
  let Component2: Component<{ options: T2 }> | undefined = $derived(
    comp2Config ? ComponentRegistry.get(comp2Config.component) as Component<{ options: T2 }> : undefined
  );

	const handleMouseDown = () => {
		if (!options) return;
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
		if (!isDragging || !options || !mainContainer) return;
		if (lastMouseP !== null) {
			const containerDim = getClientDim(mainContainer);
			const dp = getClientP(e) - lastMouseP;
			
			const delta = dp / containerDim;

			options.initialComp1Proportions += delta;
			comp2Proportion -= delta;
		}
		lastMouseP = getClientP(e);
	};

	const getClientDim = (clientContainer: HTMLDivElement): number => {
		return options?.axis === 0 ? clientContainer.clientWidth : clientContainer.clientHeight;
	}

	const getClientP = (e: MouseEvent): number =>{
		return options?.axis === 0 ? e.clientX : e.clientY;
	}

	const handleMouseOverResizeBar = (): void => {
		isResizeBarHovered = true;
	}

	const handleMouseLeaveResizeBar = (): void => {
		if (!isDragging) isResizeBarHovered = false;
	}

	onMount(() => {
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

{#if options && options.comp1 && options.comp2}
	<div bind:this={mainContainer} class="h-full flex {options.axis === 0 ? '' : 'flex-col'}">
		{#if Component1 && comp1Options}
			<div bind:this={options.comp1.contentWrapper} class="{options.axis === 0 ? 'h-full' : 'w-full'} rounded-xl overflow-hidden" style="flex: {options.initialComp1Proportions}">
				<Component1 bind:options={comp1Options} />
			</div>
		{/if}

		<button
			onmousedown={handleMouseDown}
			onmouseenter={handleMouseOverResizeBar}
			onmouseleave={handleMouseLeaveResizeBar}
			class="{options.axis === 0 ? 'h-full w-2.5' : 'w-full h-2.5'} bg-transparent flex-shrink-0 flex-grow-0 flex justify-center items-center"
			aria-label="resize-bar"
		>
			{#if isResizeBarHovered}
				<div class="{options.axis === 0 ? 'h-full w-[30%]' : 'w-full h-[30%]'} bg-blue-600 rounded-full"></div>
			{:else}
				<div class="{options.axis === 0 ? 'w-[30%] h-[5%]' : 'w-[5%] h-[30%]'} bg-gray-600 rounded-full"></div>
			{/if}
		</button>

		{#if Component2 && comp2Options  && options.comp1}
	  	<div bind:this={options.comp2.contentWrapper} class="{options.axis === 0 ? 'h-full' : 'w-full'} rounded-xl overflow-hidden" style="flex: {comp2Proportion}">
	      <Component2 bind:options={comp2Options} />
			</div>
	    {/if}
	</div>
{/if}