<script lang="ts">
	import InfoPanel from './InfoPanel.svelte';
	import CodeEditor from './CodeEditor/CodeEditor.svelte';
	import RightGutter from './RightGutter.svelte';
	import TopPanel from './TopPanel.svelte';
	import EditorBottomPanel from './CodeEditor/EditorBottomPanel.svelte';
	import SettingsPanel from './Settings/SettingsPanel.svelte';
	import ResizeableComponent from './GenericComponents/ResizeableComponent.svelte';

	import type { Problem, TestCase } from './Types/Problem';
	import type { ResizeableComponentArg } from './GenericComponents/ResizeableComponentArg';
	import type { CodeEditorArg } from './CodeEditor/Types/CodeEditorArg';
	import type { EditorBottomPanelArg } from './CodeEditor/Types/EditorBottomPanelArg';

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

	let resizeableComponentConfig: ResizeableComponentArg<Problem, ResizeableComponentArg<CodeEditorArg, EditorBottomPanelArg>> = {
		axis: 0,
		comp1: {
			component: InfoPanel,
			options: problemDto 
		},
		comp2: {
			component: ResizeableComponent,
			options: {
				axis: 1,
				comp1: {
					component: CodeEditor,
					options: {
						get editorContents() { return editorContents },
						set editorContents(editorContents: string) { editorContents = editorContents },
						get fontSize() { return fontSize },
					}
				},
				comp2: {
					component: EditorBottomPanel,
					options: {
						get isTerminalShown() { return isTerminalShown },
						get isTestCasesShown() { return isTestCasesShown },
						get testCases() { return testCases },
						get terminalContents() { return terminalContents }
					}
				},
				initialComp1Proportions: 0.75
			}
		},
		initialComp1Proportions: 0.25,
	}

</script>

<main class="w-full h-[100vh] flex flex-col">
	{#if isSettingsPanelShown}
		<SettingsPanel bind:fontSize bind:theme bind:isSettingsPanelShown />
	{/if}

	<div class="w-full h-[5%]">
		<TopPanel
			executeCallback={() => (isExecutingCode = true)}
			submitCallback={() => (isExecutingCode = true)}
			isExecuting={isExecutingCode}
			bind:isSettingsPanelShown
		/>
	</div>

	<div class="w-full h-[95%] flex">
		<div class="w-[97.5%] h-full">
			<ResizeableComponent options={ resizeableComponentConfig }/>
		</div>

		<div class="h-full w-[2.5%]">
			<RightGutter bind:isTerminalShown bind:isTestCasesShown />
		</div>
	</div>
</main>
