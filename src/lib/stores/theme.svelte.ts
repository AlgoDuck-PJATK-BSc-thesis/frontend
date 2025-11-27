import { browser } from "$app/environment";
import { applyTheme, type EditorThemeName, type ThemeName } from "$lib/Themes";

const defaultLayout: string = '{"component":"TopLevelComponent","options":{"component":{"component":"SplitPanel","options":{"axis":0,"comp1":{"component":"TopLevelComponent","options":{"component":{"component":"InfoPanel","options":{"problem":{"problemId":"","title":"","description":"","category":{"name":""},"difficulty":{"name":""},"type":{"name":""},"templateContents":"","testCases":[],"tags":[]}}}}},"comp2":{"component":"TopLevelComponent","options":{"component":{"component":"SplitPanel","options":{"axis":1,"comp1":{"component":"TopLevelComponent","options":{"component":{"component":"Editor","options":{"editorContents":"","fontSize":16}}}},"comp2":{"component":"TopLevelComponent","options":{"component":{"component":"WizardPanel","options":{"components":[{"component":"TopLevelComponent","options":{"component":{"component":"Terminal","options":{"terminalContents":""}}}},{"component":"TopLevelComponent","options":{"component":{"component":"TestCases","options":{"testCases":[]}}}}],"side":1}}}},"initialComp1Proportions":0.7282091917591124}}}},"initialComp1Proportions":0.2675471698113207}}}}';

export const userThemePreference: { theme: ThemeName } = $state({
    theme: 'dark'
});

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


export const userEditorPreferences: { theme: EditorThemeName, fontSize: number, selectedLayout: string, savedLayouts: Record<string, string> } = $state({
    theme: 'vs-dark',
    fontSize: 16,
    selectedLayout: 'default',
    savedLayouts: loadLayouts()
});
