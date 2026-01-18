<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import { userEditorPreferences } from '$lib/stores/theme.svelte';
	import type { ThemeName } from '$lib/Themes';
	import type { EditorThemeDto } from '../../../../routes/(authenticated)/(user)/categories/problems/solve/types';
	
	let {
		editorContents = $bindable(),
		readOnly
	}: { editorContents: string | undefined, fontSize?: number; readOnly?: boolean;} = $props();

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;

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
			theme: userEditorPreferences.theme.themeName,
			fontSize: userEditorPreferences.fontSize,
			minimap: {
				enabled: false
			},
			readOnly: readOnly ?? false,
			automaticLayout: true
		});

		editor.onDidChangeModelContent(() => {
      	editorContents = editor.getValue();
    });
		
	});

	$effect(() => {
		const theme: EditorThemeDto = userEditorPreferences.theme;
		const fontSize: number = userEditorPreferences.fontSize;

		if (editor && monaco) {
			monaco.editor.setTheme(theme.themeName);

			editor.updateOptions({
				fontSize: fontSize
			});
		}
	});

	export const updateEditorExternal = (newContents: string) => {
		console.log("updating")
		if (editor && monaco) {
			console.log("null check")
			const position = editor.getPosition();
			editor.setValue(newContents);
			if (position) {
				editor.setPosition(position);
			}
			console.log("done")
		}
	}

	onDestroy(() => {
		if (browser && monaco && editor) {
			// monaco.editor.getModels().forEach((model) => model.dispose());
			editor.dispose();
		}
	});
</script>

<main class="w-full h-full" bind:this={editorContainer}></main>
