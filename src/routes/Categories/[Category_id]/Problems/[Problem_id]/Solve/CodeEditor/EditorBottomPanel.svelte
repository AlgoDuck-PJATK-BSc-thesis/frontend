<script lang="ts">
	import type { TestCase } from '../Types/Problem';
	import Terminal from './BottomPanelComponents/Terminal.svelte';
	import TestCases from './BottomPanelComponents/TestCases.svelte';

	let {
		isTerminalShown,
		isTestCasesShown,
		testCases,
		terminalContents = $bindable()
	}: {
		isTerminalShown: boolean;
		isTestCasesShown: boolean;
		testCases: TestCase[];
		terminalContents: string;
	} = $props();
</script>

<main class="w-full h-full">
	{#if isTerminalShown}
		<Terminal bind:terminalContents />
	{:else if isTestCasesShown}
		<TestCases {testCases} />
	{/if}
</main>
