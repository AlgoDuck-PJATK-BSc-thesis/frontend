<script lang="ts">
	import type { TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import type { TestCase } from '$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs';
	import Monaco from '$lib/Components/GenericComponents/monaco/monaco.svelte';
	import ChevronIconSvgNew from '$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte';
	import LockIconSvg from '$lib/svg/EditorComponentIcons/LockIconSvg.svelte';
	import ErrorIconSvg from '$lib/svg/Toast/ErrorIconSvg.svelte';
	import SuccessIconSvg from '$lib/svg/Toast/SuccessIconSvg.svelte';
	import WarningIconSvg from '$lib/svg/Toast/WarningIconSvg.svelte';
	import type { FileTreeRootType } from '$lib/types/FileTreeTypes';
	import TestCaseFileTreeRoot from './HelperComponents/TestCaseFileTreeRoot.svelte';
	
	let { options = $bindable() }: { options: TestCaseComponentArgs } = $props();
	let publicTestCases: TestCase[] = $derived(options.testCases.filter((tc) => tc.isPublic));
	let nonPublicTestCases: TestCase[] = $derived(options.testCases.filter((tc) => !tc.isPublic));

	let previewedTestCase: TestCase = $derived(publicTestCases[0]);

	let root: FileTreeRootType = $derived.by(() => {
		return {
			depth: 0,
			label: 'Test cases',
			nearRootBranches: [
				{
					depth: 1,
					label: 'Public test cases',
					leaves: publicTestCases!.map((tc) => {
						return {
							depth: 2,
							label: 'test case',
							selectObject: () => {
								previewedTestCase = tc;
							}
						};
					})
				},
				{
					depth: 1,
					label: 'Non public test cases',
					leaves: nonPublicTestCases!.map((tc) => {
						return {
							depth: 2,
							label: 'test case',
							selectObject: () => {
								previewedTestCase = tc;
							}
						};
					})
				}
			]
		};
	});
</script>

<main class="w-full h-full bg-ide-card flex flex-col lg:flex-row justify-start min-w-7xl overflow-hidden text-ide-text-primary rounded-lg border border-ide-accent/10">
	<div class="bg-ide-dcard flex flex-col justify-start border-b lg:border-b-0 lg:border-r border-ide-accent/10 relative transition-all duration-300 ease-in-out overflow-x-visible
			{options.isFileTreeOpen ? 'h-48 lg:h-full lg:w-[25%] py-2' : 'h-10 lg:h-full lg:w-10'}">


		<button onclick={() => options.isFileTreeOpen = !options.isFileTreeOpen}
			class="h-12 w-12 -right-6 hoveer:cursor-pointer hover:bg-ide-bg transition-all duration-300 ease-out {options.isFileTreeOpen ? "rotate-180" : ""} flex items-center justify-center top-10 border border-ide-accent/20 rounded-full absolute bg-ide-dcard z-999"
			aria-label={options.isFileTreeOpen ? 'Collapse file tree' : 'Expand file tree'}
		>
			<ChevronIconSvgNew options={{ class: 'w-6 h-6 stroke-ide-text-primary stroke-2'}}/>
		</button>
		
		{#if options.isFileTreeOpen}
			<div class="h-full overflow-y-auto">
				<TestCaseFileTreeRoot {root} />
			</div>
		{/if}
	</div>

	<div class="flex-1 h-full flex flex-col justify-start overflow-hidden">
		<div class="w-full h-12 bg-ide-dcard flex justify-between items-center px-6 border-b border-ide-accent/10">
			<div class="flex items-center gap-3">
				<span class="text-sm font-medium text-ide-text-secondary">Test Results</span>
			</div>
			{#if previewedTestCase}
				<div class="flex items-center gap-2">
					<span class="text-xs px-2 py-1 rounded-md bg-ide-accent/10 text-ide-accent border border-ide-accent/20">
						{previewedTestCase.isPublic ? 'Public' : 'Hidden'}
					</span>
					<span class="text-xs font-mono text-ide-text-secondary/60 hidden sm:inline">
						ID: {previewedTestCase.testCaseId.substring(0, 8)}
					</span>
				</div>
			{/if}
		</div>

		{#if previewedTestCase?.isPublic}
			<div class="h-[calc(100%-3rem)] w-full flex flex-col lg:flex-row overflow-hidden">
				<div class="flex-1 lg:h-full w-full flex flex-col justify-between p-4 overflow-hidden">
					<div class="flex-1 overflow-y-auto space-y-3">
						{@render TestCaseCard('Test Input', previewedTestCase.display)}
						{@render TestCaseCard('Expected Output', previewedTestCase.displayRes)}
					</div>

					<div class="h-14 min-h-14 w-full flex justify-between items-center px-4">
						<div class="flex items-center gap-2">
							{#if previewedTestCase.isPassed}
								<SuccessIconSvg options={{class: "w-5 h-5 text-ide-text-secondary/40 stroke-green-500 stroke-[1.5]"}}/>
								<span class="text-sm text-green-500 font-medium">Passed</span>
							{:else if previewedTestCase.isPassed === false}
								<ErrorIconSvg options={{class: "w-5 h-5 text-ide-text-secondary/40 stroke-red-500 stroke-[1.5]"}}/>
								<span class="text-sm text-red-500 font-medium">Failed</span>
							{:else}
								<WarningIconSvg options={{class: "w-5 h-5 text-ide-text-secondary/40 stroke-ide-text-secondary stroke-[1.5]"}}/>
								<span class="text-sm text-ide-text-secondary/60">Not tested</span>
							{/if}
						</div>
						
						<button 
							onclick={() => options.InsertTestCase(previewedTestCase.testCaseId)} 
							class="px-4 py-2 rounded-lg bg-ide-accent/20 text-ide-accent border border-ide-accent/40 hover:bg-ide-accent/30 hover:border-ide-accent/60 transition-all duration-200 text-sm font-medium active:scale-95"
						>
							<span class="flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								<span class="hidden sm:inline">Insert Test Case</span>
								<span class="sm:hidden">Insert</span>
							</span>
						</button>
					</div>
				</div>
			</div>
		{:else}
			<div class="flex-1 flex items-center justify-center">
				<div class="text-center">
					<LockIconSvg options={{class: "w-16 h-16 text-ide-text-secondary/20 mx-auto mb-4 stroke-[2] stroke-ide-text-primary"}}/>
					<p class="text-ide-text-secondary/60 text-sm">This test case is hidden</p>
				</div>
			</div>
		{/if}
	</div>
</main>

{#snippet TestCaseCard(label: string, content: string)}
	<div class="rounded-lg overflow-hidden border-5 border-ide-dcard/50">
		<div class="px-4 py-2 bg-ide-dcard/50">
			<span class="text-xs font-medium text-ide-text-secondary uppercase tracking-wide">{label}</span>
		</div>
		
		<div class="p-4">
			<span class="text-sm text-ide-text-primary font-mono whitespace-pre-wrap break-words">{content}</span>
		</div>
	</div>
{/snippet}