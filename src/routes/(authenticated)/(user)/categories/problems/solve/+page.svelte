<script lang="ts">
	import type { Problem } from '$lib/types/Problem';
	import Ide from './Ide.svelte';
	
	let { data }: { data: {hideHeader:boolean, problem: Problem} } = $props();

	let config = $state<Record<string, object>>({
		'code-editor': { editorContents: data.problem.templateContents },
		'terminal-comp':  { terminalContents: '' },
		'problem-info':  { problem: data.problem },
		'test-cases-comp':  { testCases: data.problem.testCases },
	});
</script>

<main class="w-full h-[100vh] bg-ide-bg">
	<Ide bind:components={config} />
</main>
