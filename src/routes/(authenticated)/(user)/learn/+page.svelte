<script lang="ts">
	import Title from './_components/Title.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

	const learnAvatar = `Ducks/Outfits/duck-660d65f2-6b1f-49c0-ac05-cfc0af7dc080.png`;

	const algorithmCategories = [
		{
			href: '/learn/algorithms/sorting',
			title: 'Sorting',
			description: 'Bubble, Selection, Insertion, Merge, Quick, Heap.'
		},
		{
			href: '/learn/algorithms/searching',
			title: 'Searching',
			description: 'Linear, Binary, Jump, Interpolation.'
		},
		{
			href: '/learn/algorithms/graph',
			title: 'Graph',
			description: 'BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal, Prim.'
		},
		{
			href: '/learn/algorithms/dynamic-programming',
			title: 'Dynamic Programming',
			description: 'Fibonacci, LCS, 0/1 Knapsack, Coin Change, LIS.'
		},
		{
			href: '/learn/algorithms/greedy',
			title: 'Greedy',
			description: 'Activity Selection, Fractional Knapsack, Huffman, Job Sequencing.'
		}
	];

	const dataStructures = [
		{ href: '/learn/data-structures?tab=stack', title: 'Stack' },
		{ href: '/learn/data-structures?tab=queue', title: 'Queue' },
		{ href: '/learn/data-structures?tab=linked-list', title: 'Linked List' },
		{ href: '/learn/data-structures?tab=dynamic-array', title: 'Dynamic Array' },
		{ href: '/learn/data-structures?tab=hash-table', title: 'Hash Table' },
		{ href: '/learn/data-structures?tab=bst', title: 'BST' },
		{ href: '/learn/data-structures?tab=trie', title: 'Trie' },
		{ href: '/learn/data-structures?tab=min-heap', title: 'Min Heap' },
		{ href: '/learn/data-structures?tab=max-heap', title: 'Max Heap' },
		{ href: '/learn/data-structures?tab=graph', title: 'Graph' }
	];
</script>

<svelte:head>
	<title>Learn - AlgoDuck</title>
</svelte:head>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="relative -mb-1 space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<div class="absolute -top-2 left-[44rem]">
				<CloudfrontImage path={learnAvatar} cls="h-[7rem] w-[7.2rem] drop-shadow-md" />
			</div>

			<div class="pl-[0rem]">
				<Title
					title="LEARN"
					subtitle="Stuck on a problem? Whether you’re a beginner or advanced, it’s always worth brushing up on core algorithms and data structures. Explore visualizations, helpful tips, explanations and clean Java implementations you can reuse in your solutions."
				/>
			</div>
		</section>

		<section class="mt-1 grid gap-8 md:grid-cols-2">
			<div class="w-full">
				<div class="mb-5 text-center">
					<h2
						class="ocr-outline ocr-title isolate mb-6 px-1 text-center [font-family:var(--font-ariw9500)] text-2xl font-black tracking-widest text-[var(--color-landingpage-title)] md:text-3xl"
					>
						ALGORITHMS
					</h2>
					<p class="mx-auto max-w-xl text-sm text-[color:var(--color-landingpage-subtitle)]"></p>
				</div>

				<div class="grid gap-4">
					{#each algorithmCategories as item (item.href)}
						<a href={item.href} class="block">
							<PixelFrameSimple
								className="w-full bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-header-user),var(--color-accent-3))]"
							>
								<div
									class="rounded-[16px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
								>
									<div
										class="text-lg font-bold tracking-wide text-[color:var(--color-landingpage-subtitle)]"
									>
										{item.title}
									</div>
									<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
										{item.description}
									</div>
									<div
										class="mt-4 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
									>
										Open
									</div>
								</div>
							</PixelFrameSimple>
						</a>
					{/each}
				</div>
			</div>

			<div class="w-full">
				<div class="mb-5 text-center">
					<h2
						class="ocr-outline ocr-title isolate mb-6 px-1 text-center [font-family:var(--font-ariw9500)] text-2xl font-black tracking-widest text-[var(--color-landingpage-title)] md:text-3xl"
					>
						DATA STRUCTURES
					</h2>
					<p class="mx-auto max-w-xl text-sm text-[color:var(--color-landingpage-subtitle)]"></p>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					{#each dataStructures as item (item.href)}
						<a href={item.href} class="block">
							<PixelFrameSimple
								className="w-full bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-4),var(--color-accent-3))]"
							>
								<div
									class="rounded-[16px] border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
								>
									<div
										class="text-lg font-bold tracking-wide text-[color:var(--color-landingpage-subtitle)]"
									>
										{item.title}
									</div>
									<div
										class="mt-4 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
									>
										Open
									</div>
								</div>
							</PixelFrameSimple>
						</a>
					{/each}
				</div>
			</div>
		</section>
	</div>
</div>
