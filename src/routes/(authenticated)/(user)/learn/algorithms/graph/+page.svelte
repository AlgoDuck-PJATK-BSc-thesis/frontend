<script lang="ts">
	import Title from '../../_components/Title.svelte';
	import Tabs from '../../_components/Tabs.svelte';

	import BFS from './algorithms/BFS.svelte';
	import DFS from './algorithms/DFS.svelte';
	import Dijkstra from './algorithms/Dijkstra.svelte';
	import Kruskal from './algorithms/Kruskal.svelte';
	import Prim from './algorithms/Prim.svelte';
	import FloydWarshall from './algorithms/FloydWarshall.svelte';
	import BellmanFord from './algorithms/BellmanFord.svelte';

	const tabs = [
		{ id: 'bfs', label: 'BFS' },
		{ id: 'dfs', label: 'DFS' },
		{ id: 'dijkstra', label: 'Dijkstra' },
		{ id: 'kruskal', label: 'Kruskal' },
		{ id: 'prim', label: 'Prim' },
		{ id: 'floyd', label: 'Floyd–Warshall' },
		{ id: 'bellman', label: 'Bellman–Ford' }
	] as const;

	let active = $state<(typeof tabs)[number]['id']>('bfs');
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<Title
			title="Graph Algorithms"
			subtitle="Traverse graphs, find shortest paths, and build minimum spanning trees."
		/>

		<Tabs tabs={tabs as any} {active} onChange={(id) => (active = id as any)} />

		{#if active === 'bfs'}
			<BFS />
		{:else if active === 'dfs'}
			<DFS />
		{:else if active === 'dijkstra'}
			<Dijkstra />
		{:else if active === 'kruskal'}
			<Kruskal />
		{:else if active === 'prim'}
			<Prim />
		{:else if active === 'floyd'}
			<FloydWarshall />
		{:else}
			<BellmanFord />
		{/if}
	</div>
</div>
