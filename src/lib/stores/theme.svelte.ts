import { type EditorThemeName, type ThemeName } from "$lib/Themes";

export const SupportedLangs = ['pl', 'en'] as const;
export type Lang = typeof SupportedLangs[number];

export const userThemePreference: { theme: ThemeName, lang: Lang} = $state({
    theme: 'dark',
    lang: 'en'
});


export const userEditorPreferences: { theme: EditorThemeName, fontSize: number } = $state({
    theme: 'vs-dark',
    fontSize: 16,
});
