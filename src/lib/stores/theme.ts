import type { EditorThemeName, ThemeName } from '$lib/Themes';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const userPreferences = writable<{ theme: ThemeName }>({
    theme: 'dark'
});

export const userEditorThemePreferences = writable<{ editorTheme: EditorThemeName }>({
    editorTheme: 'vs-dark',
});

export const userEditorFontSizePreferences = writable<{ fontSize: number }>({
    fontSize: 16
});

const defaultLayout: string = '{"component":"TopLevelComponent","options":{"component":{"component":"SplitPanel","options":{"axis":0,"comp1":{"component":"TopLevelComponent","options":{"component":{"component":"InfoPanel","options":{"problem":{"problemId":"","title":"","description":"","category":{"name":""},"difficulty":{"name":""},"type":{"name":""},"templateContents":"","testCases":[],"tags":[]}}}}},"comp2":{"component":"TopLevelComponent","options":{"component":{"component":"SplitPanel","options":{"axis":1,"comp1":{"component":"TopLevelComponent","options":{"component":{"component":"Editor","options":{"editorContents":"","fontSize":16}}}},"comp2":{"component":"TopLevelComponent","options":{"component":{"component":"WizardPanel","options":{"components":[{"component":"TopLevelComponent","options":{"component":{"component":"Terminal","options":{"terminalContents":""}}}},{"component":"TopLevelComponent","options":{"component":{"component":"TestCases","options":{"testCases":[]}}}}],"side":1}}}},"initialComp1Proportions":0.7282091917591124}}}},"initialComp1Proportions":0.2675471698113207}}}}';

export const LayoutStoreId: number = Math.random() * 10000000;

export const saveLayout = (name: string, layout: string): void => {
    if (!browser) return;
    
    const existing = localStorage.getItem('editorLayouts');
    const layouts = existing ? JSON.parse(existing) : {};
    
    layouts[name] = layout;
    localStorage.setItem('editorLayouts', JSON.stringify(layouts));
};

export const loadLayouts = (): Record<string, string> => {
    if (!browser) return { 'default': defaultLayout };
    
    const stored = localStorage.getItem('editorLayouts');
    if (!stored) {
        saveLayout('default', defaultLayout);
        return { 'default': defaultLayout };
    }
    
    return JSON.parse(stored);
};

export const userEditorLayoutPreferences = writable<{ layouts: Record<string, string> }>({
    layouts: loadLayouts()
});

export const userEditorLayoutChosenPreference = writable<{ layoutId: string }>({
    layoutId: 'default'
});