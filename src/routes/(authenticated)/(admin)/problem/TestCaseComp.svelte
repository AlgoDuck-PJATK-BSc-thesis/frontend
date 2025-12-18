<script lang="ts">
    import { FetchFromApi } from "$lib/api/apiCall";
    import Monaco from "$lib/Components/GenericComponents/monaco/monaco.svelte";
    import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
	import { Editor } from "@tiptap/core";
    import type { FunctionParam, MethodRecommendation, SuggestedInputArgs, TestCase } from "./TestCase";
    import { Trie } from "./Trie";
	import StarterKit from "@tiptap/starter-kit";
	import Placeholder from "@tiptap/extension-placeholder";
	import ToolTip from "./ToolTip.svelte";
	import SuggestedInput from "./SuggestedInput.svelte";
	import MethodRecommendationComp from "./SuggestionCards/MethodRecommendationComp.svelte";
	import VariableRecommendationComp from "./SuggestionCards/VariableRecommendationComp.svelte";

    let { 
        templateContents,
        testCaseNum,
        testCase = $bindable()
    }: { 
        templateContents: string,
        testCaseNum: number,
        testCase: TestCase
    } = $props();

    let isExpanded: boolean = $state(true);
    let editorContents: string = $state("public class TestCase{\n\tpublic static void main(String[] args){\n\t\t//your arrange goes here\n\t}\n}");

    let methodRecommendationTrie: Trie<MethodRecommendation> | undefined = $state();
    let variableRecommendationTrie: Trie<FunctionParam> | undefined = $state();

    $effect(() => { 
        const templateContentsInner = templateContents;
        const editorContentsInner = editorContents;
        
        const timeoutId = setTimeout(async () => {
            var res = await FetchFromApi<{methods: MethodRecommendation[], variables: FunctionParam[]}>("AnalysisResult", {
                method: 'POST',
                body: JSON.stringify({
                    templateB64: btoa(templateContentsInner), 
                    arrangeB64: btoa(editorContentsInner)
                })
            });
            console.log(res);
            methodRecommendationTrie = new Trie<MethodRecommendation>(res.body.methods.map(e => ({ key: e.methodName, val: e })));
            variableRecommendationTrie = new Trie<FunctionParam>(res.body.variables.map(e => ({ key: e.name, val: e })));
        }, 2000);

        return () => clearTimeout(timeoutId);
    });

    let methodSuggestionOptions: SuggestedInputArgs<MethodRecommendation> = $state({
        onSelect: (selected: MethodRecommendation) => testCase.callFunc = selected,
        getCurrentRecommendationsForQuery: (prefix: string) => methodRecommendationTrie?.getAllSubtreeValues(prefix),
        DisplayComp: MethodRecommendationComp
    });

</script>

<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden transition-colors hover:border-[#454545]">
    <button 
        onclick={() => { isExpanded = !isExpanded; }} 
        class="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#2d2d2d] border-none border-b border-[#3c3c3c] cursor-pointer transition-colors hover:bg-[#37373d]"
        aria-expanded={isExpanded}
    >
        <div class="flex items-center gap-2.5">
            <div class="w-4 h-4 flex items-center justify-center transition-transform duration-150 {isExpanded ? 'rotate-90' : ''}">
                <ChevronIconSvg options={{ class: "w-3 h-3 stroke-[#858585] stroke-2" }}/>
            </div>
            <span class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-[#0e639c] text-white text-xs font-semibold rounded">{testCaseNum + 1}</span>
            <span class="text-[#e7e7e7] text-sm font-medium">Test Case</span>
        </div>
        <div class="flex items-center">
            <span class="flex items-center gap-1.5 text-xs text-[#858585] uppercase tracking-wider">
                {#if testCase.callFunc}
                    <span class="w-2 h-2 rounded-full bg-[#89d185]"></span>
                    <span>Ready</span>
                {:else}
                    <span class="w-2 h-2 rounded-full bg-[#cca700]"></span>
                    <span>Pending</span>
                {/if}
            </span>
        </div>
    </button>

    <div class="flex flex-col gap-px bg-[#3c3c3c] overflow-hidden transition-all duration-300 {isExpanded ? 'max-h-500 opacity-100' : 'max-h-0 opacity-0'}">
        <div class="bg-[#252526] p-4">
            <div class="flex items-center justify-start gap-4 mb-3">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-semibold text-[#569cd6] bg-[#569cd6]/10 px-2 py-0.5 rounded">Arrange</span>
                    </div>
                    <ToolTip options={{ tip: "How the input should be displayed to the user"}}/>
                </div>
            <div class="h-[200px] border border-[#3c3c3c] rounded-sm overflow-hidden">
                <Monaco bind:editorContents/>
            </div>
            <div class="mt-4">
                <div class="flex items-center justify-start gap-4 mb-3">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-semibold text-[#569cd6] bg-[#569cd6]/10 px-2 py-0.5 rounded">Call Function</span>
                    </div>
                    <ToolTip options={{ tip: "The method that will be called to test the user's solution"}}/>
                </div>
                <SuggestedInput bind:options={methodSuggestionOptions}/>
            </div>

            {#if testCase.callFunc}
                <div class="mt-4 pt-4 border-t border-[#3c3c3c]">
                    <div class="flex items-center justify-start gap-4 mb-3">
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-xs font-semibold text-[#569cd6] bg-[#569cd6]/10 px-2 py-0.5 rounded">Parameters</span>
                        </div>
                        <ToolTip options={{ tip: "The parameters with which the function will be called"}}/>
                    </div>
                    <div class="flex flex-col gap-2.5">
                        {#each testCase.callFunc.functionParams as param, i}
                            <div class="flex items-center gap-3 p-2 px-3 bg-[#2d2d2d] rounded border border-[#3c3c3c]">
                                <span class="font-mono text-xs text-[#4ec9b0] bg-[#4ec9b0]/10 px-1.5 py-0.5 rounded whitespace-nowrap">{param.type}</span>
                                <span class="font-mono text-xs text-[#9cdcfe] min-w-[80px]">{param.name}</span>
                                <SuggestedInput options={{
                                    onSelect: (selected: FunctionParam) => (testCase.callArgs ??= [])[i] = selected,
                                    getCurrentRecommendationsForQuery: (prefix: string) => variableRecommendationTrie?.getAllSubtreeValues(prefix),
                                    DisplayComp: VariableRecommendationComp
                                }}/>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
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