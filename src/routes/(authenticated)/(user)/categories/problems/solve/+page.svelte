<script lang="ts">
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type { CodeEditorComponentArgs, DefaultLayoutTerminalComponentArgs, InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import type { ProblemDetailsDto } from '$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs';
	import Ide from './Ide.svelte';
	
	let { data }: { data: { hideHeader:boolean, problemLoadResponse: StandardResponseDto<ProblemDetailsDto> } } = $props();

	type testCaseInsertResp = {
		modifiedCodeB64: string
	}

	const insertTestCase = async (testCaseId: string) => {
		let res = await FetchFromApi<testCaseInsertResp>("TestCaseInsert", {
			method: "POST",
			body: JSON.stringify({
				userCodeB64: btoa((config['code-editor'] as CodeEditorComponentArgs).templateContents),
				exerciseId: data.problemLoadResponse.body.problemId,
				testCaseId: testCaseId
			})
		});
		(config['code-editor'] as CodeEditorComponentArgs).templateContents = atob(res?.body?.modifiedCodeB64 ?? "")
		console.log(res);
	} 

	let config = $state<Record<string, DefaultLayoutTerminalComponentArgs>>({
		'code-editor': { templateContents: data.problemLoadResponse.body.templateContents } as CodeEditorComponentArgs,
		'terminal-comp':  { terminalContents: '' } as TerminalComponentArgs,
		'problem-info':  data.problemLoadResponse.body as InfoPanelComponentArgs,
		'test-cases-comp':  { 
			testCases: data.problemLoadResponse.body.testCases,
			InsertTestCase: insertTestCase
		} as TestCaseComponentArgs,
	});


</script>

<main class="w-full h-[100vh] bg-ide-bg">
	<Ide bind:components={config} />
</main>
