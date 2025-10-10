import type { Component } from "svelte";
import type { ComponentType } from "./ResizableComponentArg";

import Terminal from  "../IdeComponents/Terminal.svelte";
import TestCases from "../IdeComponents/TestCases.svelte";
import InfoPanel from "../IdeComponents/InfoPanel.svelte";
import CodeEditor from "../IdeComponents/CodeEditor.svelte";
import TerminalPlaceHolder from "./Placeholders/TerminalPlaceHolder.svelte";
import TestCasesPlaceholder from "./Placeholders/TestCasesPlaceholder.svelte";
import InfoPanelPlaceholder from "./Placeholders/InfoPanelPlaceholder.svelte";
import CodeEditorPlaceholder from "./Placeholders/CodeEditorPlaceholder.svelte";

export const activeProfile: { profile: string } = $state({ profile: 'default' });

export const StaticBaselineComponents: Map<ComponentType, Component<any>> = new Map<ComponentType, Component<any>>();
export const ComponentRegistry: Map<string, Map<ComponentType, Component<any>>> = new Map<string, Map<ComponentType, Component<any>>>();

export const InitializeRegistryDefault = (): void => {

    const newMap: Map<ComponentType, Component<any>> = new Map<ComponentType, Component<any>>(StaticBaselineComponents);
    newMap.set('Terminal', Terminal);
    newMap.set('TestCases', TestCases);
    newMap.set('InfoPanel', InfoPanel);
    newMap.set('Editor', CodeEditor);
    ComponentRegistry.set('default', newMap);
}

export const InitializeRegistryPlaceholder = (): void => {
    const newMap: Map<ComponentType, Component<any>> = new Map<ComponentType, Component<any>>(StaticBaselineComponents);
    newMap.set('Terminal', TerminalPlaceHolder);
    newMap.set('TestCases', TestCasesPlaceholder);
    newMap.set('InfoPanel', InfoPanelPlaceholder);
    newMap.set('Editor', CodeEditorPlaceholder);
    ComponentRegistry.set('placeholder', newMap);
}

export const IntializeRegistryCustom = (profileId: string, customSetup: Map<ComponentType, Component<any>>): void => {
    const newMap: Map<ComponentType, Component<any>> = new Map<ComponentType, Component<any>>(StaticBaselineComponents);
    customSetup.forEach((v, k) => {
        newMap.set(k, v);
    });
    ComponentRegistry.set(profileId, newMap);
}
