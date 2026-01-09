<script lang="ts">
	import Title from '../../_components/Title.svelte';
	import Tabs from '../../_components/Tabs.svelte';

	import BubbleSort from './algorithms/BubbleSort.svelte';
	import SelectionSort from './algorithms/SelectionSort.svelte';
	import InsertionSort from './algorithms/InsertionSort.svelte';
	import MergeSort from './algorithms/MergeSort.svelte';
	import QuickSort from './algorithms/QuickSort.svelte';
	import HeapSort from './algorithms/HeapSort.svelte';

	const tabs = [
		{ id: 'bubble', label: 'Bubble' },
		{ id: 'selection', label: 'Selection' },
		{ id: 'insertion', label: 'Insertion' },
		{ id: 'merge', label: 'Merge' },
		{ id: 'quick', label: 'Quick' },
		{ id: 'heap', label: 'Heap' }
	];

	let active = $state('bubble');
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<Title
				title="SORTING"
				subtitle="Visualize how arrays are rearranged and compare time/space tradeoffs."
			/>
			<Tabs {tabs} {active} onChange={(id) => (active = id)} />
		</section>

		<section class="rounded-3xl px-2 pb-10 md:px-0">
			{#if active === 'bubble'}
				<BubbleSort />
			{:else if active === 'selection'}
				<SelectionSort />
			{:else if active === 'insertion'}
				<InsertionSort />
			{:else if active === 'merge'}
				<MergeSort />
			{:else if active === 'quick'}
				<QuickSort />
			{:else}
				<HeapSort />
			{/if}
		</section>
	</div>
</div>
