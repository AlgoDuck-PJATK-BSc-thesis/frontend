<script lang="ts">
	import Title from '../../_components/Title.svelte';
	import Tabs from '../../_components/Tabs.svelte';

	import ActivitySelection from './algorithms/ActivitySelection.svelte';
	import FractionalKnapsack from './algorithms/FractionalKnapsack.svelte';
	import HuffmanCoding from './algorithms/HuffmanCoding.svelte';
	import JobSequencing from './algorithms/JobSequencing.svelte';

	const tabs = [
		{ id: 'activity-selection', label: 'Activity Selection' },
		{ id: 'fractional-knapsack', label: 'Fractional Knapsack' },
		{ id: 'huffman-coding', label: 'Huffman Coding' },
		{ id: 'job-sequencing', label: 'Job Sequencing' }
	];

	let active = $state('activity-selection');
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<Title title="GREEDY" subtitle="" />
			<Tabs {tabs} {active} onChange={(id) => (active = id)} />
		</section>

		<section class="rounded-3xl px-2 pb-10 md:px-0">
			{#if active === 'activity-selection'}
				<ActivitySelection />
			{:else if active === 'fractional-knapsack'}
				<FractionalKnapsack />
			{:else if active === 'huffman-coding'}
				<HuffmanCoding />
			{:else}
				<JobSequencing />
			{/if}
		</section>
	</div>
</div>
