<script lang="ts">
	import type { StandardResponseDto } from '$lib/api/apiCall';
	import type { CodeEditorComponentArgs, DefaultLayoutTerminalComponentArgs, InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import type { ProblemDetailsDto } from '$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs';
	import Ide from './Ide.svelte';
	
	let { data }: { data: { hideHeader:boolean, problemLoadResponse: StandardResponseDto<ProblemDetailsDto> } } = $props();

	let config = $state<Record<string, DefaultLayoutTerminalComponentArgs>>({
		'code-editor': { templateContents: data.problemLoadResponse.body.templateContents } as CodeEditorComponentArgs,
		'terminal-comp':  { terminalContents: '' } as TerminalComponentArgs,
		'problem-info':  data.problemLoadResponse.body as InfoPanelComponentArgs,
		'test-cases-comp':  { testCases: data.problemLoadResponse.body.testCases } as TestCaseComponentArgs,
	});
</script>

<main class="w-full h-[100vh] bg-ide-bg">
	<Ide bind:components={config} />
</main>
