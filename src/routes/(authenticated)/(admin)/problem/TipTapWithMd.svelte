<script lang="ts">
	import { Editor } from "@tiptap/core";
	import Placeholder from "@tiptap/extension-placeholder";
	import StarterKit from "@tiptap/starter-kit";
	import BoldIconSvg from "./editorIcons/BoldIconSvg.svelte";
	import ItalicIconSvelte from "./editorIcons/ItalicIconSvelte.svelte";
	import UnderlineIconSvg from "./editorIcons/UnderlineIconSvg.svelte";
	import DropDownSelect from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelect.svelte";
	import OrderedListIcon from "./editorIcons/OrderedListIcon.svelte";
	import UnorderedListIcon from "./editorIcons/UnorderedListIcon.svelte";
    import type { Level } from '@tiptap/extension-heading';
	import CodeEditorIconSvg from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp1/CodeEditorIconSvg.svelte";
	import RedoIconSvg from "./editorIcons/RedoIconSvg.svelte";
	import UndoIconSvg from "./editorIcons/UndoIconSvg.svelte";
	import DropDownSelect2 from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelect2.svelte";
	import HeaderDisplayComp from "./HeaderDisplayComp.svelte";

    let { editorContents = $bindable() }: { editorContents: string } = $props()
    let tiptapEditor: Editor;

    const redo = () => {
        tiptapEditor.chain().focus().redo().run();
    }
    const undo = () => {
        tiptapEditor.chain().focus().undo().run();
    }
    const toggleBold = () => {
        tiptapEditor.chain().focus().toggleBold().run();
    }
    const toggleUnderline = () => {
        tiptapEditor.chain().focus().toggleUnderline().run();
    }
    const toggleItalics = () => {
        tiptapEditor.chain().focus().toggleItalic().run();
    }
    const toggleBulletList = () => {
        tiptapEditor.chain().focus().toggleBulletList().run();
    }
    const toggleOrderedList = () => {
        tiptapEditor.chain().focus().toggleOrderedList().run();
    }
    const toggleCodeBlock = () => {
        tiptapEditor.chain().focus().toggleCodeBlock().run();
    }

</script>
<main class="flex flex-col gap-1">
    <menu class="w-full px-2 h-8 flex flex-row justify-between">
        <div class="w-full h-full bg-[#2d2d2d] rounded-md flex flex-row">
            <div class="flex flex-row gap-1 justify-between items-center h-full px-3">
                <button onclick={undo} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
                    <UndoIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]'}}/>
                </button>
                <button onclick={redo} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
                    <RedoIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]'}}/>
                </button>
            </div>
            <div class="flex flex-row gap-1 justify-between items-center h-full px-3">
                <button onclick={toggleBold} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
                    <BoldIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]'}}/>
                </button>
                <button onclick={toggleItalics} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
                    <ItalicIconSvelte options={{ class: 'w-full h-full stroke-white stroke-[2]'}}/>
                </button>
                <button onclick={toggleUnderline} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
                    <UnderlineIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]'}}/>
                </button>
            </div>
            <div class="flex flex-row gap-1 items-center h-full px-3">
                <button onclick={toggleOrderedList} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
                    <OrderedListIcon options={{ class: 'w-full h-full stroke-white stroke-[2]'}}/>
                </button>
                <button onclick={toggleBulletList} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
                    <UnorderedListIcon options={{ class: 'w-full h-full stroke-white stroke-[2]'}}/>
                </button>
            </div>
            <div class="flex flex-row gap-1 items-center h-full px-3">
                <button onclick={toggleCodeBlock} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
                    <CodeEditorIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]'}}/>
                </button>
            </div>
            <div class="w-40 h-full py-0.5 px-3">
                <DropDownSelect2 options={{
                    options: ([{
                        key: {
                            label: 'Normal'
                        },
                        value: 0
                    }]).concat(Array(6).keys().toArray().map(i => {return {
                        key: {
                            label: `Heading ${i + 1}`
                        },
                        value: i + 1
                    }})),
                    onSelectCallback: (selected: number) => {
                        if (selected === 0){
                            tiptapEditor.chain().focus().setParagraph().run();
                        }else{
                            tiptapEditor.chain().focus().toggleHeading({ level : Math.min(Math.max(selected, 1), 6) as Level })
                        }
                    },
                    displayComp: HeaderDisplayComp
                }}/>
            </div>
        </div>
    </menu>
    <div class="editor-wrapper">
        <div {@attach node => {
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
                    editorContents = editor.getText();
                },
                editorProps: {
                    handleKeyDown: (view, event) => {}
                }
            })

            return () => {
                tiptapEditor?.destroy()
            }
        }} class=""></div>
    </div>

</main>

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

    .editor-wrapper :global(.tiptap ul) {
        list-style-type: disc;
        padding-left: 1.5rem;
        margin: 0;
    }

    .editor-wrapper :global(.tiptap ol) {
        list-style-type: decimal;
        padding-left: 1.5rem;
        margin: 0;
    }

    .editor-wrapper :global(.tiptap li) {
        margin: 0.25rem 0;
    }

    .editor-wrapper :global(.tiptap ul ul) {
        list-style-type: circle;
    }

    .editor-wrapper :global(.tiptap ul ul ul) {
        list-style-type: square;
    }

    .editor-wrapper :global(.tiptap ol ol) {
        list-style-type: lower-alpha;
    }

    .editor-wrapper :global(.tiptap ol ol ol) {
        list-style-type: lower-roman;
    }

    .editor-wrapper :global(.tiptap ol ol ol) {
        list-style-type: lower-roman;
    }

    .editor-wrapper :global(.tiptap h1) {
        font-weight: 600;
        font-size: xx-large;
    }
    .editor-wrapper :global(.tiptap h2) {
        font-weight: 500;
        font-size: x-large;
    }
    .editor-wrapper :global(.tiptap h3) {
        font-weight: 400;
        font-size: larger;
    }
    .editor-wrapper :global(.tiptap h4) {
        font-weight: 400;
        font-size: large;
    }
    .editor-wrapper :global(.tiptap h5) {
        font-weight: 300;
        font-size: large;
    }
    .editor-wrapper :global(.tiptap h6) {
        font-weight: 300;
    }

</style>
