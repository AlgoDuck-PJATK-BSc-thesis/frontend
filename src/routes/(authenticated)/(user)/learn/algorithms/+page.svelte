<script lang="ts">
	import Title from '../_components/Title.svelte';
	import LearnCard from '../_components/LearnCard.svelte';

	const cards = [
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
			description: 'Fibonacci, LCS, Knapsack, Coin Change, LIS.'
		},
		{
			href: '/learn/algorithms/greedy',
			title: 'Greedy',
			description: 'Activity Selection, Fractional Knapsack, Huffman Coding, Job Sequencing.'
		}
	];
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<Title
				title="ALGORITHMS"
				subtitle="Pick a category, then explore each algorithm with visuals + Java code."
			/>

			<div class="grid gap-6 md:grid-cols-2">
				{#each cards as c}
					<LearnCard href={c.href} title={c.title} description={c.description} />
				{/each}
			</div>
		</section>
	</div>
</div>
