<script lang="ts">
	import { Editor } from "@tiptap/core";
	import Placeholder from "@tiptap/extension-placeholder";
	import StarterKit from "@tiptap/starter-kit";
	import Underline from "@tiptap/extension-underline";
	import BoldIconSvg from "./editorIcons/BoldIconSvg.svelte";
	import ItalicIconSvelte from "./editorIcons/ItalicIconSvelte.svelte";
	import UnderlineIconSvg from "./editorIcons/UnderlineIconSvg.svelte";
	import OrderedListIcon from "./editorIcons/OrderedListIcon.svelte";
	import UnorderedListIcon from "./editorIcons/UnorderedListIcon.svelte";
	import type { Level } from '@tiptap/extension-heading';
	import CodeEditorIconSvg from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp1/CodeEditorIconSvg.svelte";
	import RedoIconSvg from "./editorIcons/RedoIconSvg.svelte";
	import UndoIconSvg from "./editorIcons/UndoIconSvg.svelte";
	import DropDownSelect2 from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelect2.svelte";
	import HeaderDisplayComp from "./HeaderDisplayComp.svelte";

	let { editorContents = $bindable() }: { editorContents: string } = $props();
	let tiptapEditor: Editor;
	
	let isBold = $state(false);
	let isItalic = $state(false);
	let isUnderline = $state(false);
	let isBulletList = $state(false);
	let isOrderedList = $state(false);
	let isCodeBlock = $state(false);
	let currentHeadingLevel = $state(0);

	const updateActiveStates = () => {
		if (!tiptapEditor) return;
		
		isBold = tiptapEditor.isActive('bold');
		isItalic = tiptapEditor.isActive('italic');
		isUnderline = tiptapEditor.isActive('underline');
		isBulletList = tiptapEditor.isActive('bulletList');
		isOrderedList = tiptapEditor.isActive('orderedList');
		isCodeBlock = tiptapEditor.isActive('codeBlock');
		
		currentHeadingLevel = 0;
		for (let i = 1; i <= 6; i++) {
			if (tiptapEditor.isActive('heading', { level: i })) {
				currentHeadingLevel = i;
				break;
			}
		}
	};

	const redo = () => {
		tiptapEditor.chain().focus().redo().run();
	};
	const undo = () => {
		tiptapEditor.chain().focus().undo().run();
	};
	const toggleBold = () => {
		tiptapEditor.chain().focus().toggleBold().run();
	};
	const toggleUnderline = () => {
		tiptapEditor.chain().focus().toggleUnderline().run();
	};
	const toggleItalics = () => {
		tiptapEditor.chain().focus().toggleItalic().run();
	};
	const toggleBulletList = () => {
		tiptapEditor.chain().focus().toggleBulletList().run();
	};
	const toggleOrderedList = () => {
		tiptapEditor.chain().focus().toggleOrderedList().run();
	};
	const toggleCodeBlock = () => {
		tiptapEditor.chain().focus().toggleCodeBlock().run();
	};

	const headingOptions = [
		{ key: { label: 'Normal' }, value: 0 },
		{ key: { label: 'Heading 1' }, value: 1 },
		{ key: { label: 'Heading 2' }, value: 2 },
		{ key: { label: 'Heading 3' }, value: 3 },
		{ key: { label: 'Heading 4' }, value: 4 },
		{ key: { label: 'Heading 5' }, value: 5 },
		{ key: { label: 'Heading 6' }, value: 6 },
	];

	const handleHeadingChange = (selected: number) => {
		if (selected === 0) {
			tiptapEditor.chain().focus().setParagraph().run();
		} else {
			tiptapEditor.chain().focus().setHeading({ level: selected as Level }).run();
		}
	};
</script>

<main class="flex flex-col gap-1">
	<menu class="w-full px-2 h-8 flex flex-row justify-between">
		<div class="w-full h-full bg-[#2d2d2d] rounded-md flex flex-row">
			<div class="flex flex-row gap-1 justify-between items-center h-full px-3">
				<button onclick={undo} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
					<UndoIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]' }} />
				</button>
				<button onclick={redo} class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%]">
					<RedoIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]' }} />
				</button>
			</div>
			<div class="flex flex-row gap-1 justify-between items-center h-full px-3">
				<button
					onclick={toggleBold}
					class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%] {isBold ? 'bg-[#4a4a4a]' : ''}"
				>
					<BoldIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]' }} />
				</button>
				<button
					onclick={toggleItalics}
					class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%] {isItalic ? 'bg-[#4a4a4a]' : ''}"
				>
					<ItalicIconSvelte options={{ class: 'w-full h-full stroke-white stroke-[2]' }} />
				</button>
				<button
					onclick={toggleUnderline}
					class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%] {isUnderline ? 'bg-[#4a4a4a]' : ''}"
				>
					<UnderlineIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]' }} />
				</button>
			</div>
			<div class="flex flex-row gap-1 items-center h-full px-3">
				<button
					onclick={toggleOrderedList}
					class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%] {isOrderedList ? 'bg-[#4a4a4a]' : ''}"
				>
					<OrderedListIcon options={{ class: 'w-full h-full stroke-white stroke-[2]' }} />
				</button>
				<button
					onclick={toggleBulletList}
					class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%] {isBulletList ? 'bg-[#4a4a4a]' : ''}"
				>
					<UnorderedListIcon options={{ class: 'w-full h-full stroke-white stroke-[2]' }} />
				</button>
			</div>
			<div class="flex flex-row gap-1 items-center h-full px-3">
				<button
					onclick={toggleCodeBlock}
					class="w-7 h-7 hover:bg-[#3c3c3c] p-1.5 rounded-[25%] {isCodeBlock ? 'bg-[#4a4a4a]' : ''}"
				>
					<CodeEditorIconSvg options={{ class: 'w-full h-full stroke-white stroke-[2]' }} />
				</button>
			</div>
			<div class="w-40 h-full py-0.5 px-3">
				<DropDownSelect2
					options={{
						options: headingOptions,
						onSelectCallback: handleHeadingChange,
						displayComp: HeaderDisplayComp
					}}
				/>
			</div>
		</div>
	</menu>
	<div class="editor-wrapper">
		<div
			{@attach (node) => {
				tiptapEditor = new Editor({
					element: node,
					extensions: [
						StarterKit.configure({
							heading: {
								levels: [1, 2, 3, 4, 5, 6]
							}
						}),
						Underline,
						Placeholder.configure({
							placeholder: 'Example: True (cycle detected)'
						})
					],
					onTransaction: () => {
						tiptapEditor = tiptapEditor;
						updateActiveStates();
					},
					onUpdate: ({ editor }: { editor: Editor }) => {
						editorContents = editor.getHTML();
					},
					onSelectionUpdate: () => {
						updateActiveStates();
					},
					editorProps: {
						handleKeyDown: (view, event) => {}
					}
				});

				return () => {
					tiptapEditor?.destroy();
				};
			}}
			class=""
		></div>
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
		min-height: 150px;
		max-height: 250px;
		overflow-x: hidden;
		overflow-y: auto;
		outline: none;
	}

	.editor-wrapper :global(.tiptap:focus) {
		border-color: #6b9ed8;
	}

	.editor-wrapper :global(.tiptap p.is-editor-empty:first-child::before) {
		color: var(--color-ide-text-secondary);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		opacity: 0.5;
	}

	.editor-wrapper :global(.tiptap strong) {
		font-weight: 700;
	}

	.editor-wrapper :global(.tiptap em) {
		font-style: italic;
	}

	.editor-wrapper :global(.tiptap u) {
		text-decoration: underline;
	}

	.editor-wrapper :global(.tiptap ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	.editor-wrapper :global(.tiptap ol) {
		list-style-type: decimal;
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	.editor-wrapper :global(.tiptap li) {
		margin: 0.25rem 0;
	}

	.editor-wrapper :global(.tiptap li p) {
		margin: 0;
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

	.editor-wrapper :global(.tiptap h1) {
		font-weight: 700;
		font-size: 2rem;
		line-height: 1.2;
		margin: 1rem 0 0.5rem 0;
	}

	.editor-wrapper :global(.tiptap h2) {
		font-weight: 600;
		font-size: 1.5rem;
		line-height: 1.25;
		margin: 0.875rem 0 0.5rem 0;
	}

	.editor-wrapper :global(.tiptap h3) {
		font-weight: 600;
		font-size: 1.25rem;
		line-height: 1.3;
		margin: 0.75rem 0 0.5rem 0;
	}

	.editor-wrapper :global(.tiptap h4) {
		font-weight: 600;
		font-size: 1.125rem;
		line-height: 1.35;
		margin: 0.625rem 0 0.375rem 0;
	}

	.editor-wrapper :global(.tiptap h5) {
		font-weight: 600;
		font-size: 1rem;
		line-height: 1.4;
		margin: 0.5rem 0 0.375rem 0;
	}

	.editor-wrapper :global(.tiptap h6) {
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1.4;
		margin: 0.5rem 0 0.375rem 0;
		color: #a0a0a0;
	}

	.editor-wrapper :global(.tiptap pre) {
		background: #1e1e1e;
		border-radius: 6px;
		padding: 0.75rem 1rem;
		margin: 0.5rem 0;
		overflow-x: auto;
	}

	.editor-wrapper :global(.tiptap pre code) {
		background: none;
		padding: 0;
		font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
		font-size: 0.875rem;
		color: #e0e0e0;
	}

	.editor-wrapper :global(.tiptap code) {
		background: #2a2a2a;
		border-radius: 4px;
		padding: 0.125rem 0.375rem;
		font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
		font-size: 0.875em;
		color: #e06c75;
	}

	.editor-wrapper :global(.tiptap blockquote) {
		border-left: 3px solid #6b9ed8;
		padding-left: 1rem;
		margin: 0.5rem 0;
		color: #a0a0a0;
		font-style: italic;
	}

	.editor-wrapper :global(.tiptap hr) {
		border: none;
		border-top: 1px solid #555;
		margin: 1rem 0;
	}

	.editor-wrapper :global(.tiptap p) {
		margin: 0.25rem 0;
	}

	.editor-wrapper :global(.tiptap > *:first-child) {
		margin-top: 0;
	}

	.editor-wrapper :global(.tiptap > *:last-child) {
		margin-bottom: 0;
	}
</style>