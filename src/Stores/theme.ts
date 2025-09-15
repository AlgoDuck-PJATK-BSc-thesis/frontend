import type { EditorThemeName, ThemeName } from '$lib/Themes';
import { writable } from 'svelte/store';

export const userPreferences = writable<{ theme : ThemeName}>({
    theme: 'dark'
});

export const userEditorPreferences = writable< {editorTheme: EditorThemeName }>({
    editorTheme: 'vs-dark'
});