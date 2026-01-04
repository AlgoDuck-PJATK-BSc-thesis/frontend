<script lang="ts">
    import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
    import Monaco from "$lib/Components/GenericComponents/monaco/monaco.svelte";
    import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
	import { Editor } from "@tiptap/core";
    import type { AnalysisResultDto, FunctionParam, MethodRecommendation, SuggestedInputArgs, TestCaseCreateDto, ValidationResponseStatus, VariableRecommendation } from "./TestCase";
    import { Trie } from "./Trie";
	import StarterKit from "@tiptap/starter-kit";
	import Placeholder from "@tiptap/extension-placeholder";
	import ToolTip from "./ToolTip.svelte";
	import SuggestedInput from "./SuggestedInput.svelte";
	import MethodRecommendationComp from "./SuggestionCards/MethodRecommendationComp.svelte";
	import VariableRecommendationComp from "./SuggestionCards/VariableRecommendationComp.svelte";
	import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";
	import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";

    let { 
        templateContents,
        testCaseNum,
        testCase = $bindable(),
        onRemove
    }: { 
        templateContents: string,
        testCaseNum: number,
        testCase: TestCaseCreateDto,
        onRemove?: () => void
    } = $props();

    let isExpanded: boolean = $state(true);

    let methodRecommendationTrie: Trie<MethodRecommendation> | undefined = $state();
    let variableRecommendationTrie: Trie<VariableRecommendation> | undefined = $state();

    let analysisStatus: ValidationResponseStatus | undefined = $state();
    let analysisError: string | undefined = $state();

    $effect(() => { 
        const templateContentsInner = templateContents;
        const editorContentsInner = testCase.arrangeB64;
        
        if (!editorContentsInner || editorContentsInner.trim() === '') {
            analysisStatus = undefined;
            return;
        }
        
        analysisStatus = "Pending";
        analysisError = undefined;
        
        const timeoutId = setTimeout(async () => {
            try {
                var res: StandardResponseDto<AnalysisResultDto> = await FetchFromApi<AnalysisResultDto>("AnalysisResult", {
                    method: 'POST',
                    body: JSON.stringify({
                        templateB64: btoa(templateContentsInner), 
                        arrangeB64: btoa(editorContentsInner)
                    })
                });
                
                analysisStatus = "Succeeded";
                methodRecommendationTrie = new Trie<MethodRecommendation>(
                    res.body.methods.map((e) => ({ key: e.methodName, value: e }))
                );
                variableRecommendationTrie = new Trie<FunctionParam>(
                    res.body.variables.map(e => ({ key: e.name, value: e }))
                );
            } catch (error: any) {
                methodRecommendationTrie = undefined;
                variableRecommendationTrie = undefined;
                analysisStatus = "Failed";   
                analysisError = "Syntax error.";
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    });

    let methodSuggestionOptions: SuggestedInputArgs<MethodRecommendation> = $state({
        onSelect: (selected: MethodRecommendation) => testCase.callMethod = selected,
        getCurrentRecommendationsForQuery: (prefix: string) => methodRecommendationTrie?.getAllSubtreeValues(prefix),
        DisplayComp: MethodRecommendationComp
    });

    let targetSuggestionOptions: SuggestedInputArgs<VariableRecommendation> = $state({
        onSelect: (selected: VariableRecommendation) => testCase.expected = selected as FunctionParam,
        getCurrentRecommendationsForQuery: (prefix: string) => variableRecommendationTrie?.getAllSubtreeValues(prefix),
        DisplayComp: VariableRecommendationComp
    });

    testCase.arrangeB64 = testCase.arrangeB64 || "public class TestCase{\n\tpublic static void main(String[] args){\n\t\t//your arrange goes here\n\t}\n}"; 
    testCase.isPublic = testCase.isPublic ?? true;
    testCase.orderMatters = testCase.orderMatters ?? true;

    let testCaseStatus = $derived.by(() => {
        if (analysisStatus === "Pending") return { color: "bg-[#007fd4]", label: "Analyzing", icon: "spinner" };
        if (analysisStatus === "Failed") return { color: "bg-[#f14c4c]", label: "Failed", icon: "error" };
        if (testCase.callMethod && testCase.expected) return { color: "bg-[#89d185]", label: "Ready", icon: "check" };
        return { color: "bg-[#cca700]", label: "Pending", icon: "pending" };
    });
</script>

<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden transition-colors hover:border-[#454545]">
    <div class="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#2d2d2d] border-none border-b border-[#3c3c3c] cursor-pointer transition-colors hover:bg-[#37373d]"    >
        <button class="w-full h-full flex flex-row justify-between pr-4" onclick={() => { isExpanded = !isExpanded; }}>
            <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 flex items-center justify-center transition-transform duration-150 {isExpanded ? 'rotate-90' : ''}">
                    <ChevronIconSvgNew options={{ class: "w-4 h-4 stroke-white stroke-[2]" }}/>
                </div>
                <span class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-[#0e639c] text-white text-xs font-semibold rounded">{testCaseNum + 1}</span>
                <span class="text-[#e7e7e7] text-sm font-medium">Test Case</span>
                {#if testCase.isPublic}
                    <span class="text-xs font-semibold text-[#89d185] bg-[#89d185]/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Public</span>
                {:else}
                    <span class="text-xs font-semibold text-[#858585] bg-[#858585]/15 px-1.5 py-0.5 rounded uppercase tracking-wider">Non-public</span>
                {/if}
            </div>
            <div class="flex items-center gap-3">
                <span class="flex items-center gap-1.5 text-xs text-[#858585] uppercase tracking-wider">
                    {#if testCaseStatus.icon === "spinner"}
                        <span class="w-2 h-2 rounded-full {testCaseStatus.color} animate-pulse"></span>
                    {:else}
                        <span class="w-2 h-2 rounded-full {testCaseStatus.color}"></span>
                    {/if}
                    <span>{testCaseStatus.label}</span>
                </span>
            </div>
        </button>
        {#if onRemove}
            <button onclick={() => onRemove?.()}
                class="p-1 rounded hover:bg-[#f14c4c]/20 transition-colors"
                title="Remove test case"
            >
                <BinIconSvg options={{ class: 'w-3.5 h-3.5 stroke-red-500 stroke-[2]'}}/>
            </button>
        {/if}
    </div>

    <div class="flex flex-col gap-px bg-[#3c3c3c] overflow-hidden transition-all duration-300 {isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}">
        <div class="bg-[#252526] p-4 border-b border-[#3c3c3c]">
            <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        bind:checked={testCase.isPublic}
                        class="w-4 h-4 rounded border-2 border-[#3c3c3c] bg-[#3c3c3c] checked:bg-[#0e639c] checked:border-[#0e639c] cursor-pointer accent-[#0e639c] transition-colors"
                    />
                    <span class="text-sm text-[#cccccc] group-hover:text-[#e7e7e7] transition-colors">Public</span>
                    <ToolTip options={{ tip: "Public test cases are visible to users before submission" }}/>
                </label>
                <label class="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        bind:checked={testCase.orderMatters}
                        class="w-4 h-4 rounded border-2 border-[#3c3c3c] bg-[#3c3c3c] checked:bg-[#0e639c] checked:border-[#0e639c] cursor-pointer accent-[#0e639c] transition-colors"
                    />
                    <span class="text-sm text-[#cccccc] group-hover:text-[#e7e7e7] transition-colors">Order Matters</span>
                    <ToolTip options={{ tip: "If unchecked, array/list outputs will be compared regardless of element order" }}/>
                </label>
            </div>
        </div>

        {#if analysisStatus === "Failed"}
            <div class="bg-[#5a1d1d] border-l-4 border-[#f14c4c] p-4">
                <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 stroke-[#f14c4c] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v4m0 4h.01"/>
                    </svg>
                    <div class="flex flex-col gap-1">
                        <span class="text-sm font-medium text-[#f14c4c]">
                            Syntax Error
                        </span>
                    </div>
                </div>
            </div>
        {/if}

        {#if analysisStatus === "Pending"}
            <div class="bg-[#1e3a5f] border-l-4 border-[#007fd4] p-3">
                <div class="flex items-center gap-3">
                    <div class="w-4 h-4 border-2 border-[#007fd4] border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-xs text-[#cccccc]">Analyzing code for method and variable suggestions...</span>
                </div>
            </div>
        {/if}

        <div class="bg-[#252526] p-4">
            <div class="flex items-center justify-start gap-4 mb-3">
                <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-semibold text-[#569cd6] bg-[#569cd6]/10 px-2 py-0.5 rounded">Arrange</span>
                </div>
                <ToolTip options={{ tip: "Setup code that runs before the test. Define variables and objects to use in the test."}}/>
            </div>
            <div class="h-[200px] border border-[#3c3c3c] rounded-sm overflow-hidden">
                <Monaco bind:editorContents={testCase.arrangeB64}/>
            </div>
            <div class="mt-4">
                <div class="flex items-center justify-start gap-4 mb-3">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-semibold text-[#569cd6] bg-[#569cd6]/10 px-2 py-0.5 rounded">Call Function</span>
                    </div>
                    <ToolTip options={{ tip: "The method that will be called to test the user's solution"}}/>
                    {#if analysisStatus === "Succeeded"}
                        <span class="text-[10px] text-[#89d185]">Suggestions available</span>
                    {/if}
                </div>
                <SuggestedInput bind:options={methodSuggestionOptions}/>
            </div>

            {#if testCase.callMethod}
                <div class="mt-4 pt-4 border-t border-[#3c3c3c]">
                    <div class="flex items-center justify-start gap-4 mb-3">
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-xs font-semibold text-[#569cd6] bg-[#569cd6]/10 px-2 py-0.5 rounded">Parameters</span>
                        </div>
                        <ToolTip options={{ tip: "The parameters with which the function will be called"}}/>
                    </div>
                    <div class="flex flex-col gap-2.5">
                        {#each testCase.callMethod.functionParams as param, i}
                            <div class="flex items-center gap-3 p-2 px-3 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
                                <span class="font-mono text-xs text-[#4ec9b0] bg-[#4ec9b0]/10 px-1.5 py-0.5 rounded whitespace-nowrap">{param.type}</span>
                                <span class="font-mono text-xs text-[#9cdcfe] min-w-[80px]">{param.name}</span>
                                <SuggestedInput options={{
                                    onSelect: (selected: VariableRecommendation) => (testCase.callArgs ??= [])[i] = selected as FunctionParam,
                                    getCurrentRecommendationsForQuery: (prefix: string) => variableRecommendationTrie?.getAllSubtreeValues(prefix),
                                    DisplayComp: VariableRecommendationComp
                                }}/>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
            <div class="mt-4">
                <div class="flex items-center justify-start gap-4 mb-3">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-semibold text-[#569cd6] bg-[#569cd6]/10 px-2 py-0.5 rounded">Expected Output</span>
                    </div>
                    <ToolTip options={{ tip: "The expected value against which to compare function output"}}/>
                </div>
                <SuggestedInput bind:options={targetSuggestionOptions}/>
            </div>

        </div>

        <div class="bg-[#252526] p-4">
            <div class="flex items-center justify-start gap-4 mb-3">
                <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-semibold text-[#569cd6] bg-[#569cd6]/10 px-2 py-0.5 rounded">Display Input</span>
                </div>
                <ToolTip options={{ tip: "How the input should be displayed to the user"}}/>
            </div>
            <div class="editor-wrapper">
                <div {@attach node => {
                    let tiptapEditor: Editor;
                    tiptapEditor = new Editor({
                        element: node,
                        extensions: [
                            StarterKit,
                            Placeholder.configure({
                                placeholder: 'Example: 1 -> 2 -> 3 -> 4 -> 2 (cyclic linked list)'
                            })
                        ],
                        onTransaction: () => {
                            tiptapEditor = tiptapEditor; 
                        },
                        onUpdate: ({ editor }: {editor: Editor}) => {
                            testCase.display = editor.getText();
                        },
                        editorProps: {
                            handleKeyDown: (view, event) => {}
                        }
                    })

                    return () => {
                        tiptapEditor?.destroy()
                    }
                }}></div>
            </div>
        </div>

        <div class="bg-[#252526] p-4">
            <div class="flex items-center justify-start gap-4 mb-3">
                <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-semibold text-[#89d185] bg-[#89d185]/10 px-2 py-0.5 rounded">Expected Output</span>
                </div>
                <ToolTip options={{ tip: "The expected result to display"}}/>
            </div>
            <div class="editor-wrapper">
                <div {@attach node => {
                    let tiptapEditor: Editor;
                    tiptapEditor = new Editor({
                        element: node,
                        extensions: [
                            StarterKit,
                            Placeholder.configure({
                                placeholder: 'Example: True (cycle detected)'
                            })
                        ],
                        onTransaction: () => {
                            tiptapEditor = tiptapEditor; 
                        },
                        onUpdate: ({ editor }: {editor: Editor}) => {
                            testCase.displayRes = editor.getText();
                        },
                        editorProps: {
                            handleKeyDown: (view, event) => {}
                        }
                    })

                    return () => {
                        tiptapEditor?.destroy()
                    }
                }}></div>
            </div>
        </div>
    </div>
</div>

<style>
    .editor-wrapper :global(.tiptap) {
        background: #3c3c3c;
        color: #d4d0d0;
        border-radius: 8px;
        border: 1px solid rgb(116, 114, 114);
        height: 100%;
        padding: 0.75em 1.5em 0.75em 0.75em;
        font-size: medium;
        min-height: 100px;
        max-height: 200px;
        overflow-x: hidden;
        overflow-y: auto;
        outline: none;
    }

    .editor-wrapper :global(.tiptap p.is-editor-empty:first-child::before) {
        color: var(--color-ide-text-secondary);
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
        opacity: 0.5;
    }
</style>