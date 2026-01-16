<script lang="ts">
	import Title from '../_components/Title.svelte';
	import Tabs from '../_components/Tabs.svelte';
	import { page } from '$app/stores';

	import Stack from './structures/Stack.svelte';
	import Queue from './structures/Queue.svelte';
	import LinkedList from './structures/LinkedList.svelte';
	import DynamicArray from './structures/DynamicArray.svelte';
	import HashTable from './structures/HashTable.svelte';
	import BinarySearchTree from './structures/BinarySearchTree.svelte';
	import Trie from './structures/Trie.svelte';
	import MinHeap from './structures/MinHeap.svelte';
	import MaxHeap from './structures/MaxHeap.svelte';
	import Graph from './structures/Graph.svelte';

	const tabs = [
		{ id: 'stack', label: 'Stack' },
		{ id: 'queue', label: 'Queue' },
		{ id: 'linked-list', label: 'Linked List' },
		{ id: 'dynamic-array', label: 'Dynamic Array' },
		{ id: 'hash-table', label: 'Hash Table' },
		{ id: 'bst', label: 'BST' },
		{ id: 'trie', label: 'Trie' },
		{ id: 'min-heap', label: 'Min Heap' },
		{ id: 'max-heap', label: 'Max Heap' },
		{ id: 'graph', label: 'Graph' }
	];

	let active = $state('stack');

	$effect(() => {
		const fromUrl = $page.url.searchParams.get('tab');
		if (!fromUrl) return;
		if (tabs.some((t) => t.id === fromUrl)) active = fromUrl;
	});
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<Title title="DATA STRUCTURES" subtitle="" />
			<Tabs {tabs} {active} onChange={(id) => (active = id)} />
		</section>

		<section class="rounded-3xl px-2 pb-10 md:px-0">
			{#if active === 'stack'}
				<Stack />
			{:else if active === 'queue'}
				<Queue />
			{:else if active === 'linked-list'}
				<LinkedList />
			{:else if active === 'dynamic-array'}
				<DynamicArray />
			{:else if active === 'hash-table'}
				<HashTable />
			{:else if active === 'bst'}
				<BinarySearchTree />
			{:else if active === 'trie'}
				<Trie />
			{:else if active === 'min-heap'}
				<MinHeap />
			{:else if active === 'max-heap'}
				<MaxHeap />
			{:else}
				<Graph />
			{/if}
		</section>
	</div>
</div>
