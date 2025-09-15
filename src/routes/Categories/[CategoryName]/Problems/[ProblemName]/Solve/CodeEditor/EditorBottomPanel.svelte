<script lang="ts">
	import Terminal from './BottomPanelComponents/Terminal.svelte';
	import TestCases from './BottomPanelComponents/TestCases.svelte';
	import type { EditorBottomPanelArg } from './Types/EditorBottomPanelArg';

	let { options }: { options: EditorBottomPanelArg } = $props();
</script>

<main class="w-full h-full">
	{#if options.isTerminalShown}
		<Terminal terminalContents={options.terminalContents} />
	{:else if options.isTestCasesShown}
		<TestCases testCases={options.testCases} />
	{/if}
</main>
