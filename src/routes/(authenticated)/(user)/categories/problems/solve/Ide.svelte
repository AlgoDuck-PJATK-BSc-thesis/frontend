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

	const showTerminalStatusToast = (status: TerminalStatus): void => {
		switch (status) {
			case "Completed":
				toast.success(status);
				break;
			case "CompilationFailure":
			case "RuntimeError":
			case "ServiceFailure":
			case "Timeout":
				toast.error(status);
				break;
		}
	};

	const handleTerminalStatus = (
		executionResponse: SubmissionResult,
		onComplete?: (response: SubmissionResult) => void
	): void => {
		(components['terminal-comp'] as TerminalComponentArgs).stdOut = executionResponse.stdOutput;
		(components['terminal-comp'] as TerminalComponentArgs).stdErr = executionResponse.stdError;
		
		onComplete?.(executionResponse);
		
		showTerminalStatusToast(executionResponse.status as TerminalStatus);
		
		connection?.stop();
		connected = false;
	};

	const executeCode = async (
		endpoint: string,
		onTerminalStatus?: (response: SubmissionResult) => void
	): Promise<void> => {
		const userCode = (components['code-editor'] as CodeEditorComponentArgs).userCode;
		if (!userCode) {
			return;
		}

		executingState = 'Queued';

		const res = await FetchFromApi<{ jobId: string }>(`executor/${endpoint}`, {
			method: "POST",
			body: JSON.stringify({
				codeB64: btoa(userCode),
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
				handleTerminalStatus(executionResponse, onTerminalStatus);
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

	const executeCallback = (): Promise<void> => executeCode("DryRun");

	const submitCallback = (): Promise<void> => executeCode("Submit", (executionResponse) => {
		(components['test-cases-comp'] as TestCaseComponentArgs).testCases = 
			(components['test-cases-comp'] as TestCaseComponentArgs).testCases.map(t => ({
				isPassed: executionResponse.testResults.find(ti => ti.testId == t.testCaseId)?.isTestPassed,
				...t
			}));

		if (executionResponse.status === "Completed" && executionResponse.testResults.length > 0) {
			const failedCount = executionResponse.testResults.filter(t => !t.isTestPassed).length;
			const totalCount = executionResponse.testResults.length;
			
			if (failedCount > 0) {
				toast.warning(`${totalCount - failedCount}/${totalCount} test passed`);
			} else {
				setTimeout(() => {
					toast.success(`${totalCount - failedCount}/${totalCount} test passed`);
				}, 500);
			}
		}
	});

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