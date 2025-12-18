<script lang="ts">
	import Monaco from "$lib/Components/GenericComponents/monaco/monaco.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import { Editor } from "@tiptap/core";
	import Placeholder from "@tiptap/extension-placeholder";
	import StarterKit from "@tiptap/starter-kit";
	import type { TestCase } from "./TestCase";
	import TestCaseComp from "./TestCaseComp.svelte";
	import TipTapWithMd from "./TipTapWithMd.svelte";

    let tiptapEditor: Editor;

    let problemDescription: string = $state("");
    let editorContents: string = $state("public class Solution{\n\t// your problem setup goes here\n}");

    let testCases: TestCase[] = $state([]);
</script>

<main class="w-full min-h-screen bg-[#1e1e1e] text-[#cccccc] font-sans">
    <div class="max-w-6xl mx-auto p-6 flex flex-col gap-6">
        <div class="py-4 border-b border-[#3c3c3c] mb-2">
            <h2 class="text-2xl font-normal text-[#e7e7e7] tracking-tight">Add Problem</h2>
        </div>

        <div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
            <div class="flex items-center gap-2.5 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
                <h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Problem Title</h3>
            </div>
            <div class="p-4">
                <div {@attach node => {
                    tiptapEditor = new Editor({
                        element: node,
                        extensions: [
                            StarterKit,
                            Placeholder.configure({
                                placeholder: 'Example: Linked list cycle detection'
                            })
                        ],
                        onTransaction: () => {
                            tiptapEditor = tiptapEditor; 
                        },
                        onUpdate: ({ editor }) => {
                            problemDescription = editor.getText()
                        },
                        editorProps: {
                            handleKeyDown: (view, event) => {}
                        }
                    })

                    return () => {
                        tiptapEditor?.destroy()
                    }
                }} class="w-full min-h-[40px] bg-[#3c3c3c] border border-[#3c3c3c] rounded-sm px-3 py-2 text-[#cccccc] text-sm focus-within:border-[#007fd4] transition-colors [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-[#858585] [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0"></div>
            </div>
        </div>

        <div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
            <div class="flex items-center gap-2.5 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
                <h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Problem Description</h3>
            </div>
            <div class="p-4">
                <TipTapWithMd editorContents={""}/>    
            </div>
        </div>

        <div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
            <div class="flex items-center gap-2.5 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
                <h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Problem Template</h3>
            </div>
            <div class="h-56">
                <Monaco bind:editorContents/>
            </div>
        </div>

        <div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
            <div class="flex items-center gap-2.5 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
                <h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Test Cases</h3>
            </div>
            <div class="p-4 flex flex-col gap-3">
                {#each testCases as _, i}
                    <TestCaseComp templateContents={editorContents} testCaseNum={i} bind:testCase={testCases[i]}/>
                {/each}
                <button onclick={() => {
                    testCases.push({} as TestCase)
                }} class="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0e639c] text-white border-none rounded-sm text-sm font-medium cursor-pointer transition-colors hover:bg-[#1177bb] focus:outline focus:outline-1 focus:outline-[#007fd4] focus:outline-offset-2 self-start">
                    <CrossIconSvg options={{class: "w-3.5 h-3.5 stroke-white stroke-2 rotate-45"}}/>
                    <span>Add Test Case</span>
                </button>
            </div>
        </div>
    </div>
</main>