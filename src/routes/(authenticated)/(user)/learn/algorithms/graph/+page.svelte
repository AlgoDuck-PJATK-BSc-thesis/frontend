<script lang="ts">
	import Title from '../../_components/Title.svelte';
	import Tabs from '../../_components/Tabs.svelte';

	import BFS from './algorithms/BFS.svelte';
	import DFS from './algorithms/DFS.svelte';
	import Dijkstra from './algorithms/Dijkstra.svelte';
	import BellmanFord from './algorithms/BellmanFord.svelte';
	import FloydWarshall from './algorithms/FloydWarshall.svelte';
	import Kruskal from './algorithms/Kruskal.svelte';
	import Prim from './algorithms/Prim.svelte';

	const tabs = [
		{ id: 'bfs', label: 'BFS' },
		{ id: 'dfs', label: 'DFS' },
		{ id: 'dijkstra', label: 'Dijkstra' },
		{ id: 'bellman-ford', label: 'Bellman-Ford' },
		{ id: 'floyd-warshall', label: 'Floyd-Warshall' },
		{ id: 'kruskal', label: 'Kruskal' },
		{ id: 'prim', label: 'Prim' }
	];

	let active = $state('bfs');
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<Title title="GRAPH ALGORITHMS" subtitle="" />
			<Tabs {tabs} {active} onChange={(id) => (active = id)} />
		</section>

		<section class="rounded-3xl px-2 pb-10 md:px-0">
			{#if active === 'bfs'}
				<BFS />
			{:else if active === 'dfs'}
				<DFS />
			{:else if active === 'dijkstra'}
				<Dijkstra />
			{:else if active === 'bellman-ford'}
				<BellmanFord />
			{:else if active === 'floyd-warshall'}
				<FloydWarshall />
			{:else if active === 'kruskal'}
				<Kruskal />
			{:else}
				<Prim />
			{/if}
		</section>
	</div>
</div>
