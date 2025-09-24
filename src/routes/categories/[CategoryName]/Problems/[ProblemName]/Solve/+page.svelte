<script lang="ts">
	import type { Problem } from '$lib/types/Problem';
	import { InitializeRegistryDefault } from '../../../../../editor/ComponentRegistry';
	import type { ComponentType } from '../../../../../editor/ResizableComponentArg';
	import Ide from './Ide.svelte';
	
	let { data }: { data: {hideHeader:boolean, problem: Problem} } = $props();

  InitializeRegistryDefault();

	let config = $state<Record<string, object>>({
		'Editor': { editorContents: data.problem.templateContents },
		'Terminal':  { terminalContents: '' },
		'InfoPanel':  { problem: data.problem },
		'TestCases':  { testCases: data.problem.testCases },
	})

</script>

<main class="w-full h-[100vh] bg-ide-bg">
	<Ide bind:components={config} />
</main>
