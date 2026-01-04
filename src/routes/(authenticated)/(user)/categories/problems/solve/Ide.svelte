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
	import { userEditorPreferences } from '$lib/stores/theme.svelte';
	import * as signalR from '@microsoft/signalr';
	import { isTerminalStatus, type IntermediateStatus, type SubmissionResult, type TerminalStatus } from '$lib/types/domain/modules/problem/solve';
	import { toast } from '$lib/Components/Notifications/ToastStore.svelte';

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
	let executingState: IntermediateStatus | TerminalStatus | undefined = $state();
	let connection: signalR.HubConnection | undefined;
	let connected: boolean = false;
	let problemId: string | undefined = $derived((components['problem-info'] as InfoPanelComponentArgs)?.problemId)

	const executeCallback = async (): Promise<void> => {
		if (!(components['code-editor'] as CodeEditorComponentArgs).userCode){
			return;
		}

		executingState = 'Queued'; /* TODO: add a similar status resolution system as with Validation */

		let res = await FetchFromApi<{ jobId: string }>("executor/DryRun", {
			method: "POST",
			body: JSON.stringify({
				codeB64: btoa((components['code-editor'] as CodeEditorComponentArgs).userCode!),
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
			(components['terminal-comp'] as TerminalComponentArgs).status = executionResponse.status;
			executingState = executionResponse.status;
			if (isTerminalStatus(executionResponse.status)) {
				(components['terminal-comp'] as TerminalComponentArgs).stdOut = executionResponse.stdOutput;
				(components['terminal-comp'] as TerminalComponentArgs).stdErr = executionResponse.stdError;
				
				switch(executingState as TerminalStatus){
					case "Completed":
						toast.success(executingState);
						break;
					case "CompilationFailure":
					case "RuntimeError":
					case "ServiceFailure":
					case "Timeout":
						toast.error(executingState);
						break;
				}

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
	}


	const submitCallback = async (): Promise<void> => {
		if (!(components['code-editor'] as CodeEditorComponentArgs).userCode){
			return;
		}
		executingState = 'Queued';
		
		let res = await FetchFromApi<{ jobId: string }>("executor/Submit", {
			method: "POST",
			body: JSON.stringify({
				codeB64: btoa((components['code-editor'] as CodeEditorComponentArgs).userCode!),
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
			(components['terminal-comp'] as TerminalComponentArgs).status = executionResponse.status;
			executingState = executionResponse.status;
			if (isTerminalStatus(executionResponse.status)) {
				(components['terminal-comp'] as TerminalComponentArgs).stdOut = executionResponse.stdOutput;
				(components['terminal-comp'] as TerminalComponentArgs).stdErr = executionResponse.stdError;
				
				(components['test-cases-comp'] as TestCaseComponentArgs).testCases = 
					(components['test-cases-comp'] as TestCaseComponentArgs).testCases.map(t => ({
						isPassed: executionResponse.testResults.find(ti => ti.testId == t.testCaseId)?.isTestPassed,
						...t
					}));
				connection?.stop();
				connected = false;

				switch(executingState as TerminalStatus){
					case "Completed":
						toast.success(executingState);
						if (executionResponse.testResults.length > 0){
							if (executionResponse.testResults.some(t => !t.isTestPassed)){
								toast.warning(`${executionResponse.testResults.filter(t => !t.isTestPassed).length}/${executionResponse.testResults.length} test passed`)
							}else{
								setTimeout(() => {
									toast.success(`${executionResponse.testResults.length}/${executionResponse.testResults.length} test passed`)
								}, 500);
							}
						}
						toast.success
						break;
					case "CompilationFailure":
					case "RuntimeError":
					case "ServiceFailure":
					case "Timeout":
						console.log("toasting");
						toast.error(executingState);
						break;
				}
				executingState = undefined;
			}
		});
		
		try {
			await connection.start();
			connected = true;
			await connection.invoke("SubscribeToJob", { jobId: jobId });
			
		} catch (err) {
			connected = false;
		}
	};

	const registerAndSelectLayout = async (layoutId: string): Promise<void> => {
		if (!layouts[layoutId]){
			let res = await FetchFromApi<{ layoutId: string, layoutContents: string }>("CustomLayoutDetails", {
				method: "GET"
			}, fetch, new URLSearchParams({ layoutId: layoutId }))

			console.log(res.body.layoutContents);
			layouts[layoutId] = res.body.layoutContents;
		}
		if (layouts[layoutId])
			userEditorPreferences.layout = layoutId;

	} 
</script>

<main class="w-full h-[100vh] flex flex-col">
	{#if isSettingsPanelShown}
		<SettingsPanel bind:isSettingsPanelShown />
	{/if}
	<div class="w-full h-[5%]">
		<TopPanel
		problemId={problemId}
		{registerAndSelectLayout}
		{executingState}
		{executeCallback}
		{submitCallback}
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
