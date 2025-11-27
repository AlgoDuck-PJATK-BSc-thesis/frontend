<script lang="ts">
	import Monaco from '$lib/Components/GenericComponents/monaco/monaco.svelte';
	import type { TestCaseComponentArgs } from '$lib/types/ComponentLoadArgs';
	import type { FileTreeRootType } from '$lib/types/FileTreeTypes';
	import type { TestCase } from '$lib/types/Problem';
	import TestCaseFileTreeRoot from '../../../../../../../../../../routes/(authenticated)/(user)/categories/problems/solve/IdeComponents/HelperComponents/TestCaseFileTreeRoot.svelte';
	
	let { options = $bindable() }: { options: TestCaseComponentArgs } = $props();


	let publicTestCases: TestCase[] = $derived(options.testCases.filter((tc) => tc.isPublic));
	let nonPublicTestCases: TestCase[] = $derived(options.testCases.filter((tc) => !tc.isPublic));

	// svelte-ignore state_referenced_locally
	let previewedTestCase: TestCase = $state(publicTestCases[0] );

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

<main class="w-full h-full bg-ide-card flex justify-start min-w-7xl overflow-hidden text-ide-text-primary">
	<div class="h-full bg-ide-dcard flex flex-col justfiy-start w-[25%] py-2">
		<TestCaseFileTreeRoot {root} />
	</div>
	<div class="h-full w-[75%] flex flex-col justify-start">
		<div
			class="w-full h-10 bg-ide-dcard flex justify-end items-center px-5 text-lg select-none font-bold"
		>
			<span class="flex justify-center items-center text-ide-text-secondary">Testing results</span>
		</div>
		{#if previewedTestCase.isPublic}
			<div class="h-[calc(100%-2.5rem)] w-full flex overflow-y-hidden">
				<div class="h-full w-[50%] bg-ide-bg flex flex-col justify-start">
					<div class="w-full h-10 flex justify-center items-center text center">
						<span class="flex justify-center items-center text-ide-text-secondary select-none"
							>{`${previewedTestCase.testCaseId.substring(0, 8)} preview`}</span
						>
					</div>
					<div class="w-full h-[calc(100%-2.5rem)] p-1.5">
						<div class="w-full h-full overflow-hidden rounded-xl">
							<Monaco
								editorContents={'//something'}
								readOnly={true}
								fontSize={16}
							/>
						</div>
					</div>
				</div>
				<div class="h-full w-[50%] flex flex-col px-2 pt-4 justify-between">
					<div class="overflow-hidden">
						{@render TestCaseCard('Test input', previewedTestCase!.display)}
						{@render TestCaseCard('Expected output', previewedTestCase!.displayRes)}
					</div>
					<div class="h-10 min-h-10 w-full flex justify-between items-center px-3 my-2">
						<span class="flex justify-center items-center"
							>Passed: {previewedTestCase!.isPassed ? previewedTestCase!.isPassed : 'N/A'}</span
						>
						<button
							class="hover:cursor-pointer h-[90%] px-2 rounded-md border-2 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]"
						>
							<span class="flex justify-center items-center">Insert test case</span>
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</main>

{#snippet TestCaseCard(label: string, content: string)}
	<main class="rounded-2xl mb-2">
		<div class="w-full p-2 flex justify-center">
			<div class="w-[99%] h-full p-1 rounded-md overflow-hidden">
				<span class="w-full h-full flex items-center justify-start text-ide-text-secondary"
					>{label}</span
				>
			</div>
		</div>

		<div class="w-fullborder-0 bg-ide-dcard p-3 pt-2 rounded-md overflow-hidden">
			<span class="w-full h-full flex items-center justify-center">{content}</span>
		</div>
	</main>
{/snippet}
