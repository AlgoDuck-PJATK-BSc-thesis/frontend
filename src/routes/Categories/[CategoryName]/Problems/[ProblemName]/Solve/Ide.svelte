<script lang="ts">
	import InfoPanel from './Ide/InfoPanel.svelte';
	import CodeEditor from './CodeEditor.svelte';
	import RightGutter from './RightGutter.svelte';
	import TopPanel from './TopPanel.svelte';
	import EditorBottomPanel from './EditorBottomPanel.svelte';
	import SettingsPanel from './SettingsPanel.svelte';
	import ResizeableComponent from './ResizeableComponent.svelte';
	import type { ResizeableComponentArg } from '$lib/types/ResizeableComponentArg';
	import type { Problem, TestCase } from '$lib/types/Problem';
	import type { CodeEditorArg } from '$lib/types/CodeEditorArg';
	import type { EditorBottomPanelArg } from '$lib/types/EditorBottomPanelArg';


	let { problemDto }: { problemDto: Problem } = $props();

	let editorContents: string = $state(problemDto.templateContents);
	let isTerminalShown: boolean = $state(true);
	let isTestCasesShown: boolean = $state(false);
	let terminalContents: string = $state('');
	let testCases: TestCase[] = $state(problemDto.testCases);
	let isExecutingCode: boolean = $state(false);
	let fontSize: number = $state(16);
	let theme: string = $state('vs-dark');
	let isSettingsPanelShown = $state(false);

	// let resizeableComponentConfig: ResizeableComponentArg<Problem, ResizeableComponentArg<CodeEditorArg, EditorBottomPanelArg>> = {
	// 	axis: 0,
	// 	comp1: {
	// 		component: InfoPanel,
	// 		options: problemDto 
	// 	},
	// 	comp2: {
	// 		component: ResizeableComponent,
	// 		options: {
	// 			axis: 1,
	// 			comp1: {
	// 				component: CodeEditor,
	// 				options: {
	// 					get editorContents() { return editorContents },
	// 					set editorContents(editorContents: string) { editorContents = editorContents },
	// 					get fontSize() { return fontSize },
	// 				}
	// 			},
	// 			comp2: {
	// 				component: EditorBottomPanel,
	// 				options: {
	// 					get isTerminalShown() { return isTerminalShown },
	// 					get isTestCasesShown() { return isTestCasesShown },
	// 					get testCases() { return testCases },
	// 					get terminalContents() { return terminalContents }
	// 				}
	// 			},
	// 			initialComp1Proportions: 0.75
	// 		}
	// 	},
	// 	initialComp1Proportions: 0.25,
	// }

	// placeholders for now
	const executeCode = (): void => {
		isExecutingCode = true;
	}

	const submitCode = (): void => {
		isExecutingCode = true;
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
			isExecuting={isExecutingCode}
			bind:isSettingsPanelShown
		/>
	</div>

	<div class="w-full h-[95%] flex">
		<div class="w-[97.5%] h-full">
			<!-- <ResizeableComponent options={ resizeableComponentConfig }/> -->
		</div>

		<div class="h-full w-[2.5%]">
			<RightGutter bind:isTerminalShown bind:isTestCasesShown />
		</div>
	</div>
</main>
