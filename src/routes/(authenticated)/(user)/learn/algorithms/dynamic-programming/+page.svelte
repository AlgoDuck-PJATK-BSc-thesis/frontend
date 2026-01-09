<script lang="ts">
	import Title from '../../_components/Title.svelte';
	import Tabs from '../../_components/Tabs.svelte';

	import FibonacciDP from './algorithms/FibonacciDP.svelte';
	import LCS from './algorithms/LCS.svelte';
	import Knapsack01 from './algorithms/Knapsack01.svelte';
	import CoinChange from './algorithms/CoinChange.svelte';
	import LIS from './algorithms/LIS.svelte';

	const tabs = [
		{ id: 'fib', label: 'Fibonacci' },
		{ id: 'lcs', label: 'LCS' },
		{ id: 'knapsack', label: '0/1 Knapsack' },
		{ id: 'coin', label: 'Coin Change' },
		{ id: 'lis', label: 'LIS' }
	] as const;

	let active = $state<(typeof tabs)[number]['id']>('fib');
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<Title
			title="Dynamic Programming"
			subtitle="Break a problem into overlapping subproblems and reuse computed answers."
		/>

		<Tabs tabs={tabs as any} {active} onChange={(id) => (active = id as any)} />

		{#if active === 'fib'}
			<FibonacciDP />
		{:else if active === 'lcs'}
			<LCS />
		{:else if active === 'knapsack'}
			<Knapsack01 />
		{:else if active === 'coin'}
			<CoinChange />
		{:else}
			<LIS />
		{/if}
	</div>
</div>
