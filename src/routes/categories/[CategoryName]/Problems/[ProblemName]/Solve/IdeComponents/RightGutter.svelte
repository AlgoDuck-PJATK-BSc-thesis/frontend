<script lang="ts">
	import TerminalIconSvg from "$lib/svg/EditorComponentIcons/TerminalIconSvg.svelte";
	import TestCasesIconSvg from "$lib/svg/EditorComponentIcons/TestCasesIconSvg.svelte";

	let { isTestCasesShown = $bindable(), isTerminalShown = $bindable() } = $props();
</script>

<main class="w-full h-full bg-ide-bg flex flex-col-reverse justify-start items-center">
	<button
		onclick={() => {
			isTestCasesShown = false;
			isTerminalShown = true;
		}}
		aria-label="terminal-select"
		class="w-[95%] aspect-square hover:cursor-pointer {isTerminalShown
			? 'border-ide-accent bg-ide-bg shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]'
			: 'bg-ide-bg'} flex justify-center items-center mb-2 rounded-md"
	>
		<div class="w-[80%] aspect-square flex justify-center items-center">
			<TerminalIconSvg options={{ color: '#ffffff' }} />
		</div>
	</button>
	<button
		onclick={() => {
			isTestCasesShown = true;
			isTerminalShown = false;
		}}
		aria-label="test-case-select"
		class="w-[80%] aspect-square hover:cursor-pointer {isTestCasesShown
			? 'border-ide-accent bg-ide-bg shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]'
			: 'bg-ide-bg'} flex justify-center items-center mb-1 rounded-md"
	>
		<TestCasesIconSvg options={{ color: '#ffffff' }} />
	</button>
</main>
