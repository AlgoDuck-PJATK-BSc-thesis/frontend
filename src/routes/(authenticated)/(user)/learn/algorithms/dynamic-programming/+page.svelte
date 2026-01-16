<script lang="ts">
	import Title from '../../_components/Title.svelte';
	import Tabs from '../../_components/Tabs.svelte';

	import FibonacciDP from './algorithms/FibonacciDP.svelte';
	import LCS from './algorithms/LCS.svelte';
	import Knapsack01 from './algorithms/Knapsack01.svelte';
	import CoinChange from './algorithms/CoinChange.svelte';
	import LIS from './algorithms/LIS.svelte';

	const tabs = [
		{ id: 'fibonacci', label: 'Fibonacci' },
		{ id: 'coin-change', label: 'Coin Change' },
		{ id: 'lcs', label: 'Longest Common Subsequence' },
		{ id: 'lis', label: 'Longest Increasing Subsequence' },
		{ id: 'knapsack-01', label: '0/1 Knapsack' }
	];

	let active = $state('fibonacci');
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<Title title="DYNAMIC PROGRAMMING" subtitle="" />
			<Tabs {tabs} {active} onChange={(id) => (active = id)} />
		</section>

		<section class="rounded-3xl px-2 pb-10 md:px-0">
			{#if active === 'fibonacci'}
				<FibonacciDP />
			{:else if active === 'lcs'}
				<LCS />
			{:else if active === 'knapsack-01'}
				<Knapsack01 />
			{:else if active === 'coin-change'}
				<CoinChange />
			{:else}
				<LIS />
			{/if}
		</section>
	</div>
</div>
