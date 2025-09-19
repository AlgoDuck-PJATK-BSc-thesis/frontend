<script lang="ts">
	import type { EditorBottomPanelArg } from '$lib/types/EditorBottomPanelArg';
	import Terminal from './Terminal.svelte';
	import TestCases from './TestCases.svelte';

	let { options }: { options: EditorBottomPanelArg } = $props();
</script>

<main class="w-full h-full">
	{#if options.isTerminalShown}
		<Terminal terminalContents={options.terminalContents} />
	{:else if options.isTestCasesShown}
		<TestCases testCases={options.testCases} />
	{/if}
</main>
