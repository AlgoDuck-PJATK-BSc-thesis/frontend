<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import { userEditorFontSizePreferences, userEditorThemePreferences } from '../../../../../../../Stores';
	import type { EditorThemeName } from '$lib/Themes';

	let {
		editorContents,
		fontSize,
		readOnly
	}: { editorContents: string; fontSize?: number; readOnly?: boolean;} = $props();

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;

	let editorTheme: EditorThemeName = $state('vs-dark')
	let editorFontSize: number = $state(fontSize ?? 16)

	const unsubscribeTheme = userEditorThemePreferences.subscribe(value => {
    editorTheme = value.editorTheme;
  });

	const unsubscribeFont = userEditorFontSizePreferences.subscribe(pref => {
		if (!fontSize){
			editorFontSize = pref.fontSize;
		}
	});

	onMount(async () => {
		if (!browser) return;

		monaco = (await import('./monaco')).default;
		const darkula: Monaco.editor.IStandaloneThemeData = (await import(
			'monaco-themes/themes/Dracula.json'
		)) as Monaco.editor.IStandaloneThemeData;

		monaco.editor.defineTheme('dracula', darkula);
		editor = monaco.editor.create(editorContainer, {
			value: editorContents,
			language: 'java',
			theme: editorTheme,
			fontSize: fontSize,
			minimap: {
				enabled: false
			},
			readOnly: readOnly ?? false,
			automaticLayout: true
		});
	});

	$effect(() => {
		console.log('theme:', editorTheme, 'fontSize:', editorFontSize);

		if (editor && monaco) {
			monaco.editor.setTheme(editorTheme);

			editor.updateOptions({
				fontSize: editorFontSize
			});
		}
	});

	onDestroy(() => {
		if (browser && monaco && editor) {
			// monaco.editor.getModels().forEach((model) => model.dispose());
			editor.dispose();
			unsubscribeTheme();
			unsubscribeFont();
		}
	});
</script>

<main class="w-full h-full" bind:this={editorContainer}></main>
