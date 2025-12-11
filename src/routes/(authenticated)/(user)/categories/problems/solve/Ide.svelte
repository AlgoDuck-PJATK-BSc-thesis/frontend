<script lang="ts">
	import TopPanel from './IdeComponents/TopPanel.svelte';
	import DefaultLayout from '$lib/Components/ComponentTrees/IdeComponentTree/default-layout.json'
	import Check from '$lib/Components/ComponentTrees/IdeComponentTree/check.json'
	import TabbedLayout from '$lib/Components/ComponentTrees/IdeComponentTree/tabbed-layout.json'
	import SplitLayout from '$lib/Components/ComponentTrees/IdeComponentTree/split-layout.json'
	import ComponentTreeRenderer from '$lib/Components/GenericComponents/layoutManager/ComponentTreeRenderer.svelte';
	import SettingsPanel from './Settings/SettingsPanel.svelte';
	import type { CodeEditorComponentArgs, DefaultLayoutTerminalComponentArgs, InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import { API_URL, FetchFromApi } from '$lib/api/apiCall';
	import { userEditorPreferences, type editorLayout } from '$lib/stores/theme.svelte';
	import * as signalR from '@microsoft/signalr';

  
	let { 
		components = $bindable(),
		contextInjectors
	}: { 
		components: Record<string, DefaultLayoutTerminalComponentArgs>,
	    contextInjectors?: Record<string, (options: any) => void> 

	} = $props();

	let layouts: Record<string, any> = $state({
		'default': DefaultLayout,
		'tabbed': TabbedLayout,
		'split': SplitLayout
	});

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
		status: string
	}

	type TestResult = {
		testId: string, 
		isTestPassed: boolean
	}

	let connection: signalR.HubConnection | undefined;
	let connected: boolean = false;


	const submitCode = async (runner: boolean): Promise<void> => {
		runner = true;
		
		let res = await FetchFromApi<{ jobId: string }>("executor/Submit", {
			method: "POST",
			body: JSON.stringify({
				codeB64: btoa((components['code-editor'] as CodeEditorComponentArgs).userCode),
				problemId: (components['problem-info'] as InfoPanelComponentArgs).problemId
			})
		});
		
		const jobId: string = res.body.jobId;
		
		connection = new signalR.HubConnectionBuilder()
			.withUrl(`${API_URL}/hubs/execution-status`, {
				withCredentials: true,
				transport: signalR.HttpTransportType.WebSockets
			})
			.withAutomaticReconnect()
			.build();
		
		connection.on("ExecutionStatusUpdated", (executionResponse: SubmissionResult) => {
			
			if (executionResponse.status === "complete") {
				(components['terminal-comp'] as TerminalComponentArgs).terminalContents = executionResponse.stdOutput;
				(components['test-cases-comp'] as TestCaseComponentArgs).testCases = 
					(components['test-cases-comp'] as TestCaseComponentArgs).testCases.map(t => ({
						isPassed: executionResponse.testResults.find(ti => ti.testId == t.testCaseId)?.isTestPassed,
						...t
					}));
				
				connection?.stop();
				connected = false;
			}
		});
		
		try {
			await connection.start();
			connected = true;
			
			await connection.invoke("SubscribeToJob", { jobId: jobId });
			
		} catch (err) {
			connected = false;
		}
		
		runner = false;
	};
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
		componentTree={layouts[userEditorPreferences.layout]} 
		{contextInjectors}
		bind:componentOpts={components}
		/>
	</div>
</main>
