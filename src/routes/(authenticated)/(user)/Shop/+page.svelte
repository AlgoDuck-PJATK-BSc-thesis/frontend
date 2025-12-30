<script lang="ts">
	import type { Item, DuckShopPage } from './Dtos';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';

	let { data }: { data: StandardResponseDto<CustomPageData<Item>> } = $props();

	let activeTab: 'ducks' | 'plants' = $state('ducks');

	// DUCK STUFF
	let duckCurrentPage: number = $state(data.body.currPage);
	let duckPageSize: number = $state(data.body.pageSize);

	let duckQuery = $derived(
		createQuery({
			queryKey: ['ducks', duckCurrentPage, duckPageSize],
			queryFn: async () => {
				return await FetchFromApi<CustomPageData<Item>>(
					'AllDucks',
					{ method: 'GET' },
					fetch,
					new URLSearchParams({
						currentPage: duckCurrentPage.toString(),
						pageSize: duckPageSize.toString()
					})
				);
			},
			initialData: data
		})
	);

	let duckTotalPages = $derived(Math.ceil($duckQuery.data.body.totalItems / duckPageSize));
	let duckHasPrev = $derived(duckCurrentPage > 1);
	let duckHasNext = $derived(duckCurrentPage < duckTotalPages);

	let duckAllPages = $derived(
		Array.from({ length: duckTotalPages }, (_, i) => ({
			pageNum: i + 1,
			ducks: i + 1 === duckCurrentPage ? $duckQuery.data.body.items : []
		}))
	);

	let duckOffset = $derived((duckCurrentPage - 1) * 100);

	// PLANT STUFF
	let plantCurrentPage: number = $state(1);
	let plantPageSize: number = $state(data.body.pageSize);

	let plantQuery = $derived(
		createQuery({
			queryKey: ['plants', plantCurrentPage, plantPageSize],
			queryFn: async () => {
				return await FetchFromApi<CustomPageData<Item>>(
					'AllPlants',
					{ method: 'GET' },
					fetch,
					new URLSearchParams({
						currentPage: plantCurrentPage.toString(),
						pageSize: plantPageSize.toString()
					})
				);
			}
		})
	);

	let plantTotalPages = $derived(Math.ceil(($plantQuery.data?.body.totalItems ?? 0) / plantPageSize));
	let plantHasPrev = $derived(plantCurrentPage > 1);
	let plantHasNext = $derived(plantCurrentPage < plantTotalPages);

	let plantAllPages = $derived(
		Array.from({ length: plantTotalPages }, (_, i) => ({
			pageNum: i + 1,
			plants: i + 1 === plantCurrentPage ? ($plantQuery.data?.body.items ?? []) : []
		}))
	);

	let plantOffset = $derived((plantCurrentPage - 1) * 100);

	const queryClient = useQueryClient();

	// DUCK PREFETCH
	$effect(() => {
		if (duckHasNext) {
			queryClient.prefetchQuery({
				queryKey: ['ducks', duckCurrentPage + 1, duckPageSize],
				queryFn: async () =>
					FetchFromApi<CustomPageData<Item>>(
						'AllDucks',
						{ method: 'GET' },
						fetch,
						new URLSearchParams({
							currentPage: (duckCurrentPage + 1).toString(),
							pageSize: duckPageSize.toString()
						})
					)
			});
		}
		if (duckHasPrev) {
			queryClient.prefetchQuery({
				queryKey: ['ducks', duckCurrentPage - 1, duckPageSize],
				queryFn: async () =>
					FetchFromApi<CustomPageData<Item>>(
						'AllDucks',
						{ method: 'GET' },
						fetch,
						new URLSearchParams({
							currentPage: (duckCurrentPage - 1).toString(),
							pageSize: duckPageSize.toString()
						})
					)
			});
		}
	});

	// PLANT PREFETCH
	$effect(() => {
		if (plantHasNext) {
			queryClient.prefetchQuery({
				queryKey: ['plants', plantCurrentPage + 1, plantPageSize],
				queryFn: async () =>
					FetchFromApi<CustomPageData<Item>>(
						'AllPlants',
						{ method: 'GET' },
						fetch,
						new URLSearchParams({
							currentPage: (plantCurrentPage + 1).toString(),
							pageSize: plantPageSize.toString()
						})
					)
			});
		}
		if (plantHasPrev) {
			queryClient.prefetchQuery({
				queryKey: ['plants', plantCurrentPage - 1, plantPageSize],
				queryFn: async () =>
					FetchFromApi<CustomPageData<Item>>(
						'AllPlants',
						{ method: 'GET' },
						fetch,
						new URLSearchParams({
							currentPage: (plantCurrentPage - 1).toString(),
							pageSize: plantPageSize.toString()
						})
					)
			});
		}
	});

	let currentPreviewedDuck: Item | undefined = $derived($duckQuery.data.body.items.at(0));
	let currentPreviewedPlant: Item | undefined = $derived($plantQuery.data?.body.items.at(0));

	let isDuckAnimating = $state(false);
	let isPlantAnimating = $state(false);

	const goToDuckPage = (newPage: number) => {
		if (isDuckAnimating || newPage < 1 || newPage > duckTotalPages) return;
		isDuckAnimating = true;
		duckCurrentPage = newPage;
	};

	const goToPlantPage = (newPage: number) => {
		if (isPlantAnimating || newPage < 1 || newPage > plantTotalPages) return;
		isPlantAnimating = true;
		plantCurrentPage = newPage;
	};

	const hoverAnimationTime = 3000;
	const driftAmount = 15;

	let bgImageWidth: number | undefined = $state();
	let bgImageHeight: number | undefined = $state();

	let duckViewPortWidth: number | undefined = $state();
	let duckViewPortHeight: number | undefined = $state();

	let plantViewPortWidth: number | undefined = $state();
	let plantViewPortHeight: number | undefined = $state();

	let contentRect: DOMRect | undefined = $state();

	let isArrowUpPressed: boolean = $state(false);
	let isArrowDownPressed: boolean = $state(false);

	let isDuckButtonPressed: boolean = $state(false);
	let isFlowerButtonPressed: boolean = $state(false);

	// $inspect(contentRect);
	const toggleArrowUpPressed = () => {
		isArrowUpPressed = !isArrowUpPressed;
	};
	const toggleArrowDownPressed = () => {
		isArrowDownPressed = !isArrowDownPressed;
	};

	// $inspect(isArrowUpPressed);
</script>

<main class="relative h-full w-full">
	<img
		bind:clientWidth={bgImageWidth}
		bind:clientHeight={bgImageHeight}
		class="pointer-events-none absolute inset-0 top-0 h-full object-cover select-none"
		src="/shop/store-bg.gif"
		alt="shop background gif"
	/>
	<img
		class="pointer-events-none absolute inset-0 top-0 z-500 h-full object-cover select-none"
		src="/shop/shopkeep.gif"
		alt="shopkeep"
	/>

	<div
		class="absolute top-0 z-150 flex flex-row"
		style="width: {bgImageWidth ?? 1920}px; height: {bgImageHeight ?? 1080}px;">
		<div class="relative h-full w-3/4">
			<div bind:contentRect class="absolute top-[4%] right-[1%] h-[65%] w-[91%] overflow-y-hidden">
				
				{#if activeTab === 'ducks'}
					<div
						bind:clientHeight={duckViewPortHeight}
						bind:clientWidth={duckViewPortWidth}
						class="flex h-full w-full flex-col transition-transform duration-700 ease-out"
						style="transform: translateY(-{duckOffset}%)"
						ontransitionend={() => {
							isDuckAnimating = false;
						}}
					>
						{#each duckAllPages as page (page.pageNum)}
							{@render DuckShopPage(page.ducks)}
						{/each}
					</div>
				{/if}

				{#if activeTab === 'plants'}
					<div
						bind:clientHeight={plantViewPortHeight}
						bind:clientWidth={plantViewPortWidth}
						class="flex h-full w-full flex-col transition-transform duration-700 ease-out"
						style="transform: translateY(-{plantOffset}%)"
						ontransitionend={() => {
							isPlantAnimating = false;
						}}
					>
						{#each plantAllPages as page (page.pageNum)}
							{@render PlantShopPage(page.plants)}
						{/each}
					</div>
				{/if}

				<div class="absolute right-[2%] top-[2%] flex h-20 flex-col gap-2">
					<button
						class="h-[50%] hover:cursor-pointer"
						onmousedown={() => {
							toggleArrowUpPressed();
							if (activeTab === 'ducks') {
								goToDuckPage(duckCurrentPage - 1);
							} else {
								goToPlantPage(plantCurrentPage - 1);
							}
						}}
						onmouseleave={() => {
							if (isArrowDownPressed) isArrowDownPressed = false;
						}}
						onmouseup={toggleArrowUpPressed}
					>
						<img
							class="h-full"
							src={`/src/lib/images/store/arrow-up${isArrowUpPressed ? '-down' : ''}.png`}
							alt="arrow up"
						/>
					</button>
					<button
						class="h-[50%] hover:cursor-pointer"
						onmousedown={() => {
							toggleArrowDownPressed();
							if (activeTab === 'ducks') {
								goToDuckPage(duckCurrentPage + 1);
							} else {
								goToPlantPage(plantCurrentPage + 1);
							}
						}}
						onmouseleave={() => {
							if (isArrowDownPressed) isArrowDownPressed = false;
						}}
						onmouseup={toggleArrowDownPressed}
					>
						<img
							class="h-full"
							src={`/src/lib/images/store/arrow-down${isArrowDownPressed ? '-down' : ''}.png`}
							alt="arrow down"
						/>
					</button>
				</div>
			</div>
			<div class="absolute h-[6%] top-[69%] z-999 right-[5%] bg-red-500 flex flex-row gap-1 py-[0.1%] px-[1%]">
				<button onmousedown={() => {
					isDuckButtonPressed = true;
				}}
				onmouseup={() => {
					isDuckButtonPressed = false;
					activeTab = 'ducks';
				}}
				class="h-full">
					<img class="h-full" src="/src/lib/images/store/sign-duck-{isDuckButtonPressed ? 2 : 1}.png" alt="duck tab">
				</button>
				<button onmousedown={() => {
					isFlowerButtonPressed = true;
				}}
				onmouseup={() => {
					isFlowerButtonPressed = false;
					activeTab = 'plants';
				}}
				class="h-full">
					<img class="h-full" src="/src/lib/images/store/sign-flower-{isFlowerButtonPressed ? 2 : 1}.png" alt="plant tab">
				</button>
			</div>
		</div>

		<div class="relative flex h-full w-1/4 flex-col items-center">
			<div
				class="absolute text-ide-text-primary top-[15%] flex h-[13.5%] w-[50%] flex-col items-center justify-center [font-family:var(--font-ariw9500)]"
			>
				{#if activeTab === 'ducks'}
					<h3 class="text-2xl font-bold">
						{`${currentPreviewedDuck?.name.at(0)?.toUpperCase()}${currentPreviewedDuck?.name.substring(1)}`}
					</h3>
					<div class="flex flex-row justify-center gap-3">
						<h4 class="">{currentPreviewedDuck?.price}</h4>
						<img class="h-6 w-6" src="/src/lib/images/headers/Coin.png" alt="coin" />
					</div>
				{/if}
				{#if activeTab === 'plants'}
					<h3 class="text-2xl font-bold">
						{`${currentPreviewedPlant?.name.at(0)?.toUpperCase()}${currentPreviewedPlant?.name.substring(1)}`}
					</h3>
					<div class="flex flex-row justify-center gap-3">
						<h4 class="">{currentPreviewedPlant?.price}</h4>
						<img class="h-6 w-6" src="/src/lib/images/headers/Coin.png" alt="coin" />
					</div>
				{/if}
			</div>

			{#if activeTab === 'ducks' && currentPreviewedDuck}
				<div
					class="absolute top-[40%] aspect-square w-[50%]"
					{@attach (node) => {
						let startTime: number | undefined;
						let raf: number;

						const animate = (time: number) => {
							if (!startTime) startTime = time;
							const progress = ((time - startTime) % hoverAnimationTime) / hoverAnimationTime;
							node.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * driftAmount}px)`;
							raf = requestAnimationFrame(animate);
						};

						raf = requestAnimationFrame(animate);
						return () => cancelAnimationFrame(raf);
					}}
				>
					<CloudfrontImage path={`Ducks/Outfits/duck-${currentPreviewedDuck.itemId}.png`} cls="" />
				</div>
			{/if}

			{#if activeTab === 'plants' && currentPreviewedPlant}
				<div
					class="absolute top-[40%] aspect-square w-[50%]"
					{@attach (node) => {
						let startTime: number | undefined;
						let raf: number;

						const animate = (time: number) => {
							if (!startTime) startTime = time;
							const progress = ((time - startTime) % hoverAnimationTime) / hoverAnimationTime;
							node.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * driftAmount}px)`;
							raf = requestAnimationFrame(animate);
						};

						raf = requestAnimationFrame(animate);
						return () => cancelAnimationFrame(raf);
					}}
				>
					<CloudfrontImage path={`Plants/plant-${currentPreviewedPlant.itemId}.png`} cls="" />
				</div>
			{/if}

			<div class="w-40 h-20 absolute left-[calc(50%-80px)] bottom-[15%] bg-amber-500">
				{#if activeTab === 'ducks'}
					<button onclick={async () => {
						let res = await FetchFromApi("Purchase", {
							method: "POST",
							body: JSON.stringify({
								itemId: currentPreviewedDuck?.itemId
							})
						});
						console.log(res);
					}} class="w-full h-full">
						buy
					</button>
				{/if}
				{#if activeTab === 'plants'}
					<button onclick={async () => {
						let res = await FetchFromApi("Purchase", {
							method: "POST",
							body: JSON.stringify({
								itemId: currentPreviewedPlant?.itemId
							})
						});
						console.log(res);
					}} class="w-full h-full">
						buy
					</button>
				{/if}
			</div>
		</div>
	</div>
</main>

{#snippet DuckShopPage(items: Array<Item>)}
	<div
		class="relative flex-shrink-0"
		style="width: {duckViewPortWidth ?? '0'}px; height: {duckViewPortHeight ?? '0'}px;"
	>
		<img
			src="/shop/edited-photo.png"
			class="pointer-events-none absolute inset-0 h-full w-full select-none"
			alt=""
		/>
		<div
			class="relative grid h-full w-full grid-cols-4 grid-rows-3 gap-x-[1.5%] gap-y-[4%] px-[1.5%] py-[2%]"
		>
			{#each items as item}
				<button
					class="flex h-full w-full items-center justify-center hover:cursor-pointer"
					onclick={() => (currentPreviewedDuck = item)}
				>
					<CloudfrontImage
						path={`Ducks/Outfits/duck-${item.itemId}.png`}
						cls="h-full aspect-square"
						alt={item.itemId}
					/>
				</button>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet PlantShopPage(items: Array<Item>)}
	<div
		class="relative flex-shrink-0"
		style="width: {plantViewPortWidth ?? '0'}px; height: {plantViewPortHeight ?? '0'}px;"
	>
		<img
			src="/shop/edited-photo.png"
			class="pointer-events-none absolute inset-0 h-full w-full select-none"
			alt=""
		/>
		<div
			class="relative grid h-full w-full grid-cols-4 grid-rows-3 gap-x-[1.5%] gap-y-[4%] px-[1.5%] py-[2%]"
		>
			{#each items as item}
				<button
					class="flex h-full w-full items-center justify-center hover:cursor-pointer"
					onclick={() => (currentPreviewedPlant = item)}
				>
					<CloudfrontImage
						path={`Plants/plant-${item.itemId}.png`}
						cls="h-full aspect-square"
						alt={item.itemId}
					/>
				</button>
			{/each}
		</div>
	</div>
{/snippet}