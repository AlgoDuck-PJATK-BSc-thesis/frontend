<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { userThemePreference } from '$lib/stores/theme.svelte';
	import { fly } from 'svelte/transition';
	import PondDucks from './PondDucks.svelte';
	import PondPlants from './PondPlants.svelte';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import { createInfiniteQuery, useQueryClient } from '@tanstack/svelte-query';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';
	import { drawGrid, loadImageToCanvas } from './gridUtils';
	import type { ItemType, OwnedDuck, OwnedPlantDto, UsedDuckDto, UsedPlantDto } from '$lib/Components/Misc/Pond/duckTypes';
	import DuckSelectionTile from '$lib/Components/Misc/Pond/DuckSelectionTile.svelte';
	import SpinnerIconSvg from '$lib/svg/EditorComponentIcons/SpinnerIconSvg.svelte';
	import ChevronIconSvgNew from '$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte';
	import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';
	import TickIconSvg from '$lib/svg/EditorComponentIcons/TickIconSvg.svelte';

	let { userItems }: { userItems: { ducks: UsedDuckDto[]; plants: UsedPlantDto[] } } = $props();

	const queryClient = useQueryClient();

	let canvas: HTMLCanvasElement | null = $state(null);
	let canvasTrees: HTMLCanvasElement | null = $state(null);

	let mainElem: HTMLElement | undefined = $state();
	let clientHeight: number | undefined = $state();
	let clientWidth: number | undefined = $state();

	let PondSelectedDucks: UsedDuckDto[] = $state(userItems.ducks);
	let placedPlants: UsedPlantDto[] = $state(userItems.plants);

	let isSelectionMenuVisible: boolean = $state(false);
	let activeTab: ItemType = $state('duck');

	let pondDucksRef: PondDucks | undefined = $state();
	let pondPlantsRef: PondPlants | undefined = $state();

	let pondPath: string = $derived(`/src/lib/images/ponds/Homepage_${userThemePreference.theme}.png`);
	let pondTopLevelLayerPath: string = $derived(`/src/lib/images/ponds/Homepage_${userThemePreference.theme}_trees.png`);
	let workPondPath: string = $derived(`/src/lib/images/ponds/BlacknWhite.png`);

	let prevWidth = 0;
	let prevHeight = 0;
	let resizeTimeout: ReturnType<typeof setTimeout>;

	const duckQuery = createInfiniteQuery({
		queryKey: ['user/item/duck'],
		initialPageParam: 1,
		queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
			return await FetchFromApi<CustomPageData<OwnedDuck>>(
				'user/item/duck',
				{ method: 'GET' },
				fetch,
				new URLSearchParams({ page: `${pageParam}`, pageSize: '12' })
			);
		},
		getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<OwnedDuck>>) =>
			firstPage.body.prevCursor ?? undefined,
		getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<OwnedDuck>>) =>
			lastPage.body.nextCursor ?? undefined,
		select: (data: any) => data.pages.map((p: any) => p.body.items).flat()
	});

	const plantQuery = createInfiniteQuery({
		queryKey: ['user/item/plant'],
		initialPageParam: 1,
		queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
			return await FetchFromApi<CustomPageData<OwnedPlantDto>>(
				'user/item/plant', { 
					method: 'GET'
				},
				fetch,
				new URLSearchParams({ page: `${pageParam}`, pageSize: '12' })
			);
		},
		getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<OwnedPlantDto>>) =>
			firstPage.body.prevCursor ?? undefined,
		getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<OwnedPlantDto>>) =>
			lastPage.body.nextCursor ?? undefined,
		select: (data: any) => data.pages.map((p: any) => p.body.items).flat()
	});

	const loadPond = async () => {
		if (!canvas || !canvasTrees) return;
		const containerWidth = canvas?.parentElement?.clientWidth ?? canvas?.clientWidth ?? 406;
		const containerHeight = canvas?.parentElement?.clientHeight ?? canvas?.clientHeight ?? 210;

		canvas.width = containerWidth;
		canvas.height = containerHeight;

		await loadImageToCanvas(canvas, pondPath, false);

		canvasTrees.width = containerWidth;
		canvasTrees.height = containerHeight;

		await loadImageToCanvas(canvasTrees, pondTopLevelLayerPath, false);
	};

	const handleResize = async () => {
		if (!canvas || !canvasTrees) return;

		const newWidth = canvas.parentElement?.clientWidth ?? canvas.clientWidth;
		const newHeight = canvas.parentElement?.clientHeight ?? canvas.clientHeight;

		if (newWidth === prevWidth && newHeight === prevHeight) return;

		canvas.width = newWidth;
		canvas.height = newHeight;

		await loadImageToCanvas(canvas, pondPath, false);
		
		canvasTrees.width = newWidth;
		canvasTrees.height = newHeight;

		await loadImageToCanvas(canvasTrees, pondTopLevelLayerPath, false);

		prevWidth = newWidth;
		prevHeight = newHeight;
	};

	const debouncedResize = () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(handleResize, 10);
	};

	$effect(() => {
		pondPath;
		loadPond();
	});

	$effect(() => {
		if (clientWidth !== undefined && clientHeight !== undefined) {
			debouncedResize();
		}
	});

	const handleDuckSelect = async (duck: OwnedDuck) => {
		const endpoint = duck.isSelectedForPond ? 'DropItem' : 'SelectItem';

		await FetchFromApi(
			endpoint,
			{
				method: 'PUT',
				body: JSON.stringify({ itemId: duck.itemId })
			},
			fetch
		);

		if (!duck.isSelectedForPond) {
			PondSelectedDucks.push(duck);
			pondDucksRef?.addDuck(duck);
		} else {
			PondSelectedDucks = PondSelectedDucks.filter((d) => d.itemId !== duck.itemId);
			pondDucksRef?.removeDuck(duck.itemId);
		}

		queryClient.setQueryData(['user/item/duck'], (oldData: any) => {
			if (!oldData) return oldData;
			return {
				...oldData,
				pages: oldData.pages.map((page: any) => ({
					...page,
					body: {
						...page.body,
						items: page.body.items.map((d: OwnedDuck) =>
							d.itemId === duck.itemId ? { ...d, isSelectedForPond: !duck.isSelectedForPond } : d
						)
					}
				}))
			};
		});
	};

	const handlePlantDragStart = (e: MouseEvent, plant: OwnedPlantDto) => {
		if (pondPlantsRef?.isPlantPlaced(plant.itemId)) return;
		pondPlantsRef?.startPlantDrag(e, plant);
		isSelectionMenuVisible = false;
	};

	onMount(() => {
		prevWidth = canvas?.parentElement?.clientWidth ?? canvas?.clientWidth ?? 406;
		prevHeight = canvas?.parentElement?.clientHeight ?? canvas?.clientHeight ?? 210;

		loadPond();

		window.addEventListener('resize', debouncedResize);
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', debouncedResize);
		}

		return () => {
			clearTimeout(resizeTimeout);
			window.removeEventListener('resize', debouncedResize);
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', debouncedResize);
			}
		};
	});
</script>

<main bind:this={mainElem} bind:clientHeight bind:clientWidth class="relative h-full w-full">
	<canvas class="absolute z-10" bind:this={canvas} style="width: {clientWidth}px; height: {clientHeight}px;"></canvas>
	<canvas class="absolute z-30" bind:this={canvasTrees} style="width: {clientWidth}px; height: {clientHeight}px;"></canvas>

	{#if clientWidth && clientHeight && mainElem}
		<PondPlants bind:this={pondPlantsRef}
			bind:placedPlants
			containerDims={{ width: clientWidth, height: clientHeight}}
			{workPondPath}
			mainElement={mainElem}
		/>
	{/if}

	{#if clientWidth && clientHeight}
		<PondDucks
			bind:this={pondDucksRef}
			ducks={PondSelectedDucks}
			containerDims={{width: clientWidth, height: clientHeight}}
			{workPondPath}
		/>
	{/if}

	{#if !isSelectionMenuVisible && !pondPlantsRef?.getDraggedPlant()}
		<button onclick={() => {
				isSelectionMenuVisible = true;
			}}
			class="fixed left-0 top-[calc(50%-5rem)] z-999 flex h-40 w-10 items-center justify-center rounded-r-lg bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg transition-all hover:w-12 hover:from-emerald-500 hover:to-emerald-400">
			<ChevronIconSvgNew options={{ class: 'h-6 w-6 stroke-white stroke-[1]'}}/>
		</button>
	{/if}

	{#if isSelectionMenuVisible}
		{@render SelectionMenu()}
	{/if}
</main>

{#snippet DuckTab()}
	<div class="flex h-full flex-col">
		<div class="h-12 w-full flex-shrink-0 px-4">
			<h4 class="border-b-2 border-b-slate-300 py-2 text-lg font-semibold text-slate-800">
				Owned Ducks
			</h4>
		</div>
		<div class="grid min-h-0 w-full grow grid-cols-4 gap-3 overflow-y-auto p-4">
			{#if $duckQuery.isLoading}
				{#each Array(8) as _}
					<div class="aspect-square w-full animate-pulse rounded-xl bg-slate-200"></div>
				{/each}
			{:else if $duckQuery.data}
				{#each $duckQuery.data as duck}
					<DuckSelectionTile
						options={{
							duck: duck,
							onclick: () => handleDuckSelect(duck)
						}}
					/>
				{/each}
				<div {@attach node => {
					const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
						if (entries[0].isIntersecting){
							$duckQuery.fetchNextPage();
						}
					}, {
						root: node,
						rootMargin: '120px',
						threshold: 0
					});
					
					observer.observe(node);
					return () => observer.disconnect();
				}} class="col-span-4 h-4">
					{#if $duckQuery.isFetchingNextPage}
						<SpinnerIconSvg/>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet PlantTab()}
	<div class="flex h-full flex-col">
		<div class="h-12 w-full flex-shrink-0 px-4 flex justify-between">
			<h4 class="border-b-2 border-b-slate-300 py-2 text-lg font-semibold text-slate-800">
				Owned Plants
			</h4>
			<button onclick={(e: MouseEvent) => {
				if (!pondPlantsRef) return;
				isSelectionMenuVisible = false;
				pondPlantsRef.ToggleDeleteMode();
			}} class="h-10">
				<img class="h-full" src="/src/lib/images/ponds/shovel.png" alt="shovel"/>
			</button>
		</div>
		<div class="grid min-h-0 w-full flex-1 grid-cols-4 gap-3 overflow-y-auto p-4">
			{#if $plantQuery.isLoading}
				{#each Array(8) as _}
					<div class="aspect-square w-full animate-pulse rounded-xl bg-slate-200"></div>
				{/each}
			{:else if $plantQuery.data}
				{#each $plantQuery.data as plant}
					{@const placed = pondPlantsRef?.isPlantPlaced(plant.itemId) ?? false}
					<div
						class="relative flex aspect-square w-full items-center justify-center rounded-xl p-2 transition-all
						{placed
							? 'cursor-not-allowed bg-slate-300 opacity-60'
							: 'cursor-grab bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md hover:scale-105 hover:shadow-lg active:cursor-grabbing'}"
					>
						{#if placed}
							<div class="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
								<TickIconSvg options={{ class: 'w-6 h-6 stroke-white stroke-[2]' }}/>
							</div>
						{/if}
						<button class="h-full w-full" disabled={placed} onmousedown={(e) => handlePlantDragStart(e, plant)}>
							<img
								class="pointer-events-none h-full w-full select-none object-contain"
								src={`https://d3018wbyyxg1xc.cloudfront.net/Plants/${plant.itemId}.png`}
								alt="plant"
							/>
						</button>
					</div>
				{/each}
				<div {@attach node => {
					const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
						if (entries[0].isIntersecting){
							$plantQuery.fetchNextPage();
						}
					}, {
						root: node,
						rootMargin: '120px',
						threshold: 0
					});
					
					observer.observe(node);
					return () => observer.disconnect();
				}} class="col-span-4 h-4">
					{#if $plantQuery.isFetchingNextPage}
						<div class="flex items-center justify-center py-2">
							<svg class="h-5 w-5 animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet SelectionMenu()}
	<div
		transition:fly={{ x: -50, opacity: 0, duration: 200 }}
		class="absolute left-4 top-[10%] z-500 h-[70%] w-96 overflow-hidden rounded-2xl bg-white/95 shadow-2xl backdrop-blur-sm"
	>
		<div class="flex h-full w-full flex-col">
			<div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
				<h3 class="text-xl font-bold text-slate-800">Inventory</h3>
				<button
					onclick={() => {
						isSelectionMenuVisible = false;
					}}
					class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-red-100"
					aria-label="Close menu"
				>
					<CrossIconSvg options={{ class: 'w-5 h-5 stroke-[3] stroke-slate-600 hover:text-red-500'}}/>

			</button>
			</div>

			<div class="flex gap-2 border-b border-slate-200 px-4 py-2">
				<button
					onclick={() => {
						activeTab = 'duck';
					}}
					class="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all
					{activeTab === 'duck'
						? 'bg-amber-500 text-white shadow-md'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					Ducks
				</button>
				<button
					onclick={() => {
						activeTab = 'plant';
					}}
					class="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all
					{activeTab === 'plant'
						? 'bg-emerald-500 text-white shadow-md'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					Plants
				</button>
			</div>

			<div class="min-h-0 flex-1 overflow-hidden">
				{#if activeTab === 'duck'}
					{@render DuckTab()}
				{:else}
					{@render PlantTab()}
				{/if}
			</div>
		</div>
	</div>
{/snippet}