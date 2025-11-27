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

    const newMap: Map<string, Component<any>> = new Map<string, Component<any>>(StaticBaselineComponents);
    newMap.set('Terminal', Terminal);
    newMap.set("TerminalIconSvg", TerminalIconSvg);
    
    newMap.set('TestCases', TestCases);
    newMap.set('TestCasesIconSvg', TestCasesIconSvg);
    
    newMap.set('InfoPanel', InfoPanel);
    newMap.set('InfoPanelIconSvg', InfoPanelIconSvg);
    
    newMap.set('Editor', CodeEditor);
    newMap.set('EditorIconSvg', CodeEditorIconSvg);
    
    newMap.set('SolutionAreaControlPanel', SolutionAreaControlPanel)
    
    newMap.set('EditorSettings', EditorSettings);
    newMap.set('SettingsControlPanel', SettingsControlPanel)


    

    ComponentRegistry.set('default', newMap);
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
