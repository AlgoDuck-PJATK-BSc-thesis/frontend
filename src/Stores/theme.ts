import type { EditorThemeName, ThemeName } from '$lib/Themes';
import { writable } from 'svelte/store';
import type { ComponentConfig } from '../routes/editor/ResizableComponentArg';

export const userPreferences = writable<{ theme : ThemeName}>({
    theme: 'dark'
});

export const userEditorThemePreferences = writable< {editorTheme: EditorThemeName }>({
    editorTheme: 'vs-dark',
});

export const userEditorFontSizePreferences = writable<{ fontSize: number }>({
    fontSize: 16
})

const defaultLayout: ComponentConfig<any> = JSON.parse('{"component":"TopLevelComponent","options":{"component":{"component":"SplitPanel","options":{"axis":0,"comp1":{"component":"TopLevelComponent","options":{"component":{"component":"InfoPanel","options":{"problem":{"problemId":"","title":"","description":"","category":{"name":""},"difficulty":{"name":""},"type":{"name":""},"templateContents":"","testCases":[],"tags":[]}}}}},"comp2":{"component":"TopLevelComponent","options":{"component":{"component":"SplitPanel","options":{"axis":1,"comp1":{"component":"TopLevelComponent","options":{"component":{"component":"Editor","options":{"editorContents":"","fontSize":16}}}},"comp2":{"component":"TopLevelComponent","options":{"component":{"component":"WizardPanel","options":{"components":[{"component":"TopLevelComponent","options":{"component":{"component":"Terminal","options":{"terminalContents":""}}}},{"component":"TopLevelComponent","options":{"component":{"component":"TestCases","options":{"testCases":[]}}}}],"side":1}}}},"initialComp1Proportions":0.7282091917591124}}}},"initialComp1Proportions":0.2675471698113207}}}}') as ComponentConfig<any>;


export const userEditorLayoutPreferences = writable<{ layouts: Map<string, ComponentConfig<any>> }>({
    layouts: new Map<string, ComponentConfig<any>>([
        ['default', defaultLayout]
    ])
})

export const addLayout = (id: string, config: ComponentConfig<any>) => {
    userEditorLayoutPreferences.update(store => {
        store.layouts.set(id, config);
        return store;
    });
};

export const userEditorLayoutChosenPreference = writable<{ layoutId: string}>({
    layoutId:'default' 
});