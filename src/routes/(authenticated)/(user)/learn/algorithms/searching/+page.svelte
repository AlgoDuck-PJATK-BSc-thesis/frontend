<script lang="ts">
	import Title from '../../_components/Title.svelte';
	import Tabs from '../../_components/Tabs.svelte';

	import LinearSearch from './algorithms/LinearSearch.svelte';
	import BinarySearch from './algorithms/BinarySearch.svelte';
	import JumpSearch from './algorithms/JumpSearch.svelte';
	import InterpolationSearch from './algorithms/InterpolationSearch.svelte';

	const tabs = [
		{ id: 'linear', label: 'Linear Search' },
		{ id: 'binary', label: 'Binary Search' },
		{ id: 'jump', label: 'Jump Search' },
		{ id: 'interpolation', label: 'Interpolation Search' }
	];

	let active = $state('linear');
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<Title title="SEARCHING ALGORITHMS" subtitle="" />
			<Tabs {tabs} {active} onChange={(id) => (active = id)} />
		</section>

		<section class="rounded-3xl px-2 pb-10 md:px-0">
			{#if active === 'linear'}
				<LinearSearch />
			{:else if active === 'binary'}
				<BinarySearch />
			{:else if active === 'jump'}
				<JumpSearch />
			{:else}
				<InterpolationSearch />
			{/if}
		</section>
	</div>
</div>
