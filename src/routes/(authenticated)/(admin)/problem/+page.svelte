<script lang="ts">
	import Monaco from "$lib/Components/GenericComponents/monaco/monaco.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import { Editor } from "@tiptap/core";
	import Placeholder from "@tiptap/extension-placeholder";
	import StarterKit from "@tiptap/starter-kit";
	import type { TestCase } from "./TestCase";
	import TestCaseComp from "./TestCaseComp.svelte";

    let tiptapEditor: Editor;

    let problemDescription: string = $state("");
    let editorContents: string = $state("");

    let testCases: TestCase[] = $state([]); // todo: Obv change this to objects
</script>

<main class="w-full h-full flex flex-col justify-start items-center">
    <div class="w-7xl h-full flex flex-col justify-start items-center gap-5">
        <div class="p-3 w-full">
            <h2 class="text-2xl font-semibold border-b-2 border-b-black w-full px-3 py-2">Add problem</h2>
        </div>
        <div class="w-full">
            <div class="p-3 w-full">
                <h3 class="text-2xl font-semibold border-b-2 border-b-black w-full px-3 py-2">Problem title</h3>
            </div>
            <div class="w-full relative">
                <div {@attach node => {
                    tiptapEditor = new Editor({
                        element: node,
                        extensions: [
                            StarterKit,
                            Placeholder.configure({
                                placeholder: 'Ask a question about your code... (Press Enter to send, Shift+Enter for new line)'
                            })
                        ],
                        onTransaction: () => {
                            tiptapEditor = tiptapEditor; 
                        },
                        onUpdate: ({ editor }) => {
                            problemDescription = editor.getText()
                        },
                        editorProps: {
                            handleKeyDown: (view, event) => {
                                /* if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    sendMessage();
                                    return true;
                                }
                                return false; */
                            }
                        }
                    })

                    return () => {
                        tiptapEditor?.destroy()
                    }
                }} class="w-full editor-container"></div>
            </div>
        </div>
        <div class="w-full flex flex-col">
            <div class="p-3 w-full">
                <h3 class="text-2xl font-semibold border-b-2 border-b-black w-full px-3 py-2">Problem description</h3>
            </div>
            <div class="w-full relative">
                <div {@attach node => {
                    tiptapEditor = new Editor({
                        element: node,
                        extensions: [
                            StarterKit,
                            Placeholder.configure({
                                placeholder: 'Ask a question about your code... (Press Enter to send, Shift+Enter for new line)'
                            })
                        ],
                        onTransaction: () => {
                            tiptapEditor = tiptapEditor; 
                        },
                        onUpdate: ({ editor }) => {
                            problemDescription = editor.getText()
                        },
                        editorProps: {
                            handleKeyDown: (view, event) => {
                                /* if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    sendMessage();
                                    return true;
                                }
                                return false; */
                            }
                        }
                    })

                    return () => {
                        tiptapEditor?.destroy()
                    }
                }} class="w-full editor-container"></div>
            </div>
        </div>
        <div class="w-full flex flex-col">
            <div class="p-3 w-full">
                <h3 class="text-2xl font-semibold border-b-2 border-b-black w-full px-3 py-2">Problem template</h3>
            </div>
            <div class="w-full h-52">
                <Monaco bind:editorContents readOnly={false}/>
            </div>
        </div>

        <div class="w-full flex flex-col">
            <div class="p-3 w-full">
                <h3 class="text-2xl font-semibold border-b-2 border-b-black w-full px-3 py-2">Test cases</h3>
            </div>
            <div class="w-full flex flex-col-reverse items-center">
                <div class="w-full flex flex-row justify-end p-3">
                    <button onclick={() => {
                        testCases.push({} as TestCase)
                    }} class="h-12 flex flex-row items-center gap-3">
                        <CrossIconSvg options={{class: "w-5 h-5 stroke-black stroke-[2] rotate-45"}}/>
                        <span class="h-full flex items-center">Add test case</span>
                    </button>
                </div>
                {#each testCases as _, i}
                    <TestCaseComp bind:testCase={testCases[i]}/>
                {/each}
            </div>
            
        </div>
    </div>
</main>