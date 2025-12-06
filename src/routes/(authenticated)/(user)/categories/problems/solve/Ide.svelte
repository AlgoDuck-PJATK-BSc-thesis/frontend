<script lang="ts">
	import TopPanel from './IdeComponents/TopPanel.svelte';
	import DefaultLayout from '$lib/Components/ComponentTrees/IdeComponentTree/default-layout.json'
	import Check from '$lib/Components/ComponentTrees/IdeComponentTree/check.json'
	import TabbedLayout from '$lib/Components/ComponentTrees/IdeComponentTree/tabbed-layout.json'
	import SplitLayout from '$lib/Components/ComponentTrees/IdeComponentTree/split-layout.json'
	import ComponentTreeRenderer from '$lib/Components/GenericComponents/layoutManager/ComponentTreeRenderer.svelte';
	import SettingsPanel from './Settings/SettingsPanel.svelte';
	import type { CodeEditorComponentArgs, DefaultLayoutTerminalComponentArgs, InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import { FetchFromApi } from '$lib/api/apiCall';
	import { userEditorPreferences, type editorLayout } from '$lib/stores/theme.svelte';
  
	let { 
		components = $bindable(),
	}: { 
		components: Record<string, DefaultLayoutTerminalComponentArgs>,
	} = $props();


	let layouts: Map<editorLayout, any> = new Map();

	layouts.set('default', DefaultLayout);
	layouts.set('tabbed', TabbedLayout);
	layouts.set('split', SplitLayout); // thank f**k for non reactive maps

	let isSettingsPanelShown = $state(false);

	const executeCode = async (runner: boolean): Promise<void> => {
		runner = true;
		runner = false;
	}

	type SubmissionResult = {
		stdOutput: string, 
		stdErr: string,
		executionTime: number,
		testResults: TestResult[]
	}

	type TestResult = {
		testId: string, 
		isTestPassed: boolean
	}

	const submitCode = async (runner: boolean): Promise<void> => {
		runner = true;
		let res = await FetchFromApi<SubmissionResult>("executor/Submit", {
			method: "POST",
			body: JSON.stringify({
				codeB64: btoa((components['code-editor'] as CodeEditorComponentArgs).templateContents),
				exerciseId: (components['problem-info'] as InfoPanelComponentArgs).problemId
			})
		});
		(components['terminal-comp'] as TerminalComponentArgs).terminalContents = res.body.stdOutput;
		(components['test-cases-comp'] as TestCaseComponentArgs).testCases = (components['test-cases-comp'] as TestCaseComponentArgs).testCases.map(t => {
			return {
				isPassed: res.body.testResults.find(ti => ti.testId == t.testCaseId)?.isTestPassed,
				...t
			}
		})
		runner = false;
	}
	
</script>

<main class="w-full h-[100vh] flex flex-col">
	{#if isSettingsPanelShown}
		<SettingsPanel bind:isSettingsPanelShown />
	{/if}
	<div class="w-full h-[5%]">
		<TopPanel
		executeCallback={executeCode}
		submitCallback={submitCode}
		bind:isSettingsPanelShown
		/>
	</div>
	<div class="w-full h-[95%] flex p-[0.5%]">
		<ComponentTreeRenderer
		componentTree={layouts.get(userEditorPreferences.layout)} 
		bind:componentOpts={components}
		/>
	</div>
</main>
