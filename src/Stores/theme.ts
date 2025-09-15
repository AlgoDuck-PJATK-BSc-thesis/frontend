import type { EditorThemeName, ThemeName } from '$lib/Themes';
import { writable } from 'svelte/store';

export const userPreferences = writable<{ theme : ThemeName}>({
    theme: 'dark'
});

export const userEditorThemePreferences = writable< {editorTheme: EditorThemeName }>({
    editorTheme: 'vs-dark',
});

export const userEditorFontSizePreferences = writable<{ fontSize: number }>({
    fontSize: 16
})