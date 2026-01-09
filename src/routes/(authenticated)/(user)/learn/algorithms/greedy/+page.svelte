<script lang="ts">
	import Title from '../../_components/Title.svelte';
	import Tabs from '../../_components/Tabs.svelte';

	import ActivitySelection from './algorithms/ActivitySelection.svelte';
	import FractionalKnapsack from './algorithms/FractionalKnapsack.svelte';
	import HuffmanCoding from './algorithms/HuffmanCoding.svelte';
	import JobSequencing from './algorithms/JobSequencing.svelte';

	const tabs = [
		{ id: 'activity', label: 'Activity Selection' },
		{ id: 'fractional', label: 'Fractional Knapsack' },
		{ id: 'huffman', label: 'Huffman Coding' },
		{ id: 'jobs', label: 'Job Sequencing' }
	];

	let active = $state('activity');
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<Title
			title="Greedy Algorithms"
			subtitle="Make locally optimal choices that (sometimes) lead to globally optimal solutions. Great when the problem has a provable greedy-choice property."
		/>

		<Tabs {tabs} {active} onChange={(id) => (active = id)} />

		{#if active === 'activity'}
			<ActivitySelection />
		{:else if active === 'fractional'}
			<FractionalKnapsack />
		{:else if active === 'huffman'}
			<HuffmanCoding />
		{:else}
			<JobSequencing />
		{/if}
	</div>
</div>
