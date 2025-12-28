<script lang="ts">
	import type { Duck, DuckShopPage } from './Dtos';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';

	let { data }: { data: StandardResponseDto<CustomPageData<Duck>> } = $props();

	let currentPage: number = $state(data.body.currPage);
	let pageSize: number = $state(data.body.pageSize);

	const queryClient = useQueryClient();

	let query = $derived(
		createQuery({
			queryKey: ['ducks', currentPage, pageSize],
			queryFn: async () => {
				return await FetchFromApi<CustomPageData<Duck>>(
					'Item',
					{ method: 'GET' },
					fetch,
					new URLSearchParams({
						currentPage: currentPage.toString(),
						pageSize: pageSize.toString()
					})
				);
			},
			initialData: data
		})
	);

	let totalPages = $derived(Math.ceil($query.data.body.totalItems / pageSize));
	let hasPrev = $derived(currentPage > 1);
	let hasNext = $derived(currentPage < totalPages);

	let allPages = $derived(
		Array.from({ length: totalPages }, (_, i) => ({
			pageNum: i + 1,
			ducks: i + 1 === currentPage ? $query.data.body.items : []
		}))
	);

	$effect(() => {
		if (hasNext) {
			queryClient.prefetchQuery({
				queryKey: ['ducks', currentPage + 1, pageSize],
				queryFn: async () =>
					FetchFromApi<CustomPageData<Duck>>(
						'Item',
						{ method: 'GET' },
						fetch,
						new URLSearchParams({
							currentPage: (currentPage + 1).toString(),
							pageSize: pageSize.toString()
						})
					)
			});
		}
		if (hasPrev) {
			queryClient.prefetchQuery({
				queryKey: ['ducks', currentPage - 1, pageSize],
				queryFn: async () =>
					FetchFromApi<CustomPageData<Duck>>(
						'Item',
						{ method: 'GET' },
						fetch,
						new URLSearchParams({
							currentPage: (currentPage - 1).toString(),
							pageSize: pageSize.toString()
						})
					)
			});
		}
	});

	let currentPreviewedDuck: Duck | undefined = $derived($query.data.body.items.at(0));
	let isAnimating = $state(false);

	let offset = $derived((currentPage - 1) * 100);

	const goToPage = (newPage: number) => {
		if (isAnimating || newPage < 1 || newPage > totalPages) return;
		isAnimating = true;
		currentPage = newPage;
	};

	const hoverAnimationTime = 3000;
	const driftAmount = 15;

	let bgImageWidth: number | undefined = $state();
	let bgImageHeight: number | undefined = $state();

	let viewPortWidth: number | undefined = $state();
	let viewPortHeight: number | undefined = $state();

	let contentRect: DOMRect | undefined = $state();

	let isArrowUpPressed: boolean = $state(false);
	let isArrowDownPressed: boolean = $state(false);

	$inspect(contentRect);
	const toggleArrowUpPressed = () => {
		isArrowUpPressed = !isArrowUpPressed;
	};
	const toggleArrowDownPressed = () => {
		isArrowDownPressed = !isArrowDownPressed;
	};

	$inspect(isArrowUpPressed);
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
		style="width: {bgImageWidth ?? 1920}px; height: {bgImageHeight ?? 1080}px;"
	>
		<div class="relative h-full w-3/4">
			<div bind:contentRect class="absolute top-[4%] right-[1%] h-[65%] w-[91%] overflow-y-hidden">
				<div
					bind:clientHeight={viewPortHeight}
					bind:clientWidth={viewPortWidth}
					class="flex h-full w-full flex-col transition-transform duration-700 ease-out"
					style="transform: translateY(-{offset}%)"
					ontransitionend={() => {
						isAnimating = false;
					}}
				>
					{#each allPages as page (page.pageNum)}
						{@render ShopPage(page.ducks)}
					{/each}
				</div>
				<div class="absolute right-[2%] left-[2%] flex h-20 flex-col gap-2">
					<button
						class="h-[50%] hover:cursor-pointer"
						onmousedown={() => {
							toggleArrowUpPressed();
							goToPage(currentPage - 1);
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
							goToPage(currentPage + 1);
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
		</div>

		<div class="relative flex h-full w-1/4 flex-col items-center">
			<div
				class="absolute text-ide-text-primary top-[15%] flex h-[13.5%] w-[50%] flex-col items-center justify-center [font-family:var(--font-ariw9500)]"
			>
				<h3 class="text-2xl font-bold">
					{`${currentPreviewedDuck?.name.at(0)?.toUpperCase()}${currentPreviewedDuck?.name.substring(1)}`}
				</h3>
				<div class="flex flex-row justify-center gap-3">
					<h4 class="">{currentPreviewedDuck?.price}</h4>
					<img class="h-6 w-6" src="/src/lib/images/headers/Coin.png" alt="coin" />
				</div>
			</div>
			{#if currentPreviewedDuck}
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
		</div>
	</div>
</main>

{#snippet ShopPage(ducksToRender: Array<Duck>)}
	<div
		class="relative flex-shrink-0"
		style="width: {viewPortWidth ?? '0'}px; height: {viewPortHeight ?? '0'}px;"
	>
		<img
			src="/shop/edited-photo.png"
			class="pointer-events-none absolute inset-0 h-full w-full select-none"
			alt=""
		/>
		<div
			class="relative grid h-full w-full grid-cols-4 grid-rows-3 gap-x-[1.5%] gap-y-[4%] px-[1.5%] py-[2%]"
		>
			{#each ducksToRender as duck}
				<button
					class="flex h-full w-full items-center justify-center hover:cursor-pointer"
					onclick={() => (currentPreviewedDuck = duck)}
				>
					<CloudfrontImage
						path={`Ducks/Outfits/duck-${duck.itemId}.png`}
						cls="h-full aspect-square"
						alt={duck.itemId}
					/>
				</button>
			{/each}
		</div>
	</div>
{/snippet}
