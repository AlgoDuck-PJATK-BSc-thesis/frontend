import InfoPanel from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp1/InfoPanel.svelte";
import InfoPanelIconSvg from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp1/InfoPanelIconSvg.svelte";
import InfoPanelPlaceholder from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp1/InfoPanelPlaceholder.svelte";
import CodeEditor from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp1/CodeEditor.svelte";
import CodeEditorIconSvg from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp1/CodeEditorIconSvg.svelte";
import CodeEditorPlaceholder from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp1/CodeEditorPlaceholder.svelte";
import Terminal from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp1/Terminal.svelte";
import TerminalIconSvg from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp1/TerminalIconSvg.svelte";
import TerminalPlaceHolder from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp1/TerminalPlaceHolder.svelte";
import TestCases from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp2/TestCases.svelte";
import TestCasesIconSvg from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp2/TestCasesIconSvg.svelte";
import TestCasesPlaceholder from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp2/TestCasesPlaceholder.svelte";
import SolutionAreaControlPanel from "$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/SolutionAreaControlPanel.svelte";
import EditorSettings from "$lib/Components/ComponentTrees/IdeSettingsComponentTree/WizardPanel/Comp1/EditorSettings.svelte";
import SettingsControlPanel from "$lib/Components/ComponentTrees/IdeSettingsComponentTree/WizardPanel/SettingsControlPanel.svelte";
import type { Component } from "svelte";

export const activeProfile: { profile: string } = $state({ profile: 'default' });

export const StaticBaselineComponents: Map<string, Component<any>> = new Map<string, Component<any>>();
export const ComponentRegistry: Map<string, Map<string, Component<any>>> = new Map<string, Map<string, Component<any>>>();

export const InitializeRegistryDefault = (): void => {

    const defaultMap: Map<string, Component<any>> = new Map<string, Component<any>>(StaticBaselineComponents);
    defaultMap.set('Terminal', Terminal);
    defaultMap.set("TerminalIconSvg", TerminalIconSvg);
    
    defaultMap.set('TestCases', TestCases);
    defaultMap.set('TestCasesIconSvg', TestCasesIconSvg);
    
    defaultMap.set('InfoPanel', InfoPanel);
    defaultMap.set('InfoPanelIconSvg', InfoPanelIconSvg);
    
    defaultMap.set('Editor', CodeEditor);
    defaultMap.set('EditorIconSvg', CodeEditorIconSvg);
    
    defaultMap.set('EditorSettings', EditorSettings);
    defaultMap.set('SettingsControlPanel', SettingsControlPanel)

    defaultMap.set('SolutionAreaControlPanel', SolutionAreaControlPanel)

    ComponentRegistry.set('default', defaultMap);

    
    const loading: Map<string, Component<any>> = new Map<string, Component<any>>(StaticBaselineComponents);
    loading.set('Terminal', TerminalPlaceHolder);
    loading.set("TerminalIconSvg", TerminalIconSvg);
    
    loading.set('TestCases', TestCasesPlaceholder);
    loading.set('TestCasesIconSvg', TestCasesIconSvg);
    
    loading.set('InfoPanel', InfoPanelPlaceholder);
    loading.set('InfoPanelIconSvg', InfoPanelIconSvg);
    
    loading.set('Editor', CodeEditorPlaceholder);
    loading.set('EditorIconSvg', CodeEditorIconSvg);
    
    loading.set('EditorSettings', EditorSettings);
    loading.set('SettingsControlPanel', SettingsControlPanel)

    loading.set('SolutionAreaControlPanel', SolutionAreaControlPanel)

    ComponentRegistry.set('placeholder', loading);
}

export const InitializeRegistryPlaceholder = (): void => {
    const newMap: Map<string, Component<any>> = new Map<string, Component<any>>(StaticBaselineComponents);
    newMap.set('Terminal', TerminalPlaceHolder);
    newMap.set('TestCases', TestCasesPlaceholder);
    newMap.set('InfoPanel', InfoPanelPlaceholder);
    newMap.set('Editor', CodeEditorPlaceholder);
    ComponentRegistry.set('placeholder', newMap);
}


export const IntializeRegistryCustom = (profileId: string, customSetup: Map<string, Component<any>>): void => {
    const newMap: Map<string, Component<any>> = new Map<string, Component<any>>(StaticBaselineComponents);
    customSetup.forEach((v, k) => {
        newMap.set(k, v);
    });
    ComponentRegistry.set(profileId, newMap);
}
