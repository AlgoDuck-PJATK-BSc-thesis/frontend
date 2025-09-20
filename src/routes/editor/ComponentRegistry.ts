import type { Component } from "svelte";
import type { ComponentType } from "./ResizableComponentArg";

import Terminal from "../categories/[CategoryName]/Problems/[ProblemName]/Solve/Terminal.svelte";
import TestCases from "../categories/[CategoryName]/Problems/[ProblemName]/Solve/TestCases.svelte";
import InfoPanel from "../categories/[CategoryName]/Problems/[ProblemName]/Solve/Ide/InfoPanel.svelte";
import CodeEditor from "../categories/[CategoryName]/Problems/[ProblemName]/Solve/CodeEditor.svelte";
import TerminalPlaceHolder from "./Placeholders/TerminalPlaceHolder.svelte";
import TestCasesPlaceholder from "./Placeholders/TestCasesPlaceholder.svelte";
import InfoPanelPlaceholder from "./Placeholders/InfoPanelPlaceholder.svelte";
import CodeEditorPlaceholder from "./Placeholders/CodeEditorPlaceholder.svelte";

export const ComponentRegistry = new Map<ComponentType, Component<any>>();

export const InitializeRegistryDefault = (): void => {
    ComponentRegistry.set('Terminal', Terminal);
    ComponentRegistry.set('TestCases', TestCases);
    ComponentRegistry.set('InfoPanel', InfoPanel);
    ComponentRegistry.set('Editor', CodeEditor);
}

export const InitializeRegistryPlaceholder = (): void => {
    ComponentRegistry.set('Terminal', TerminalPlaceHolder);
    ComponentRegistry.set('TestCases', TestCasesPlaceholder);
    ComponentRegistry.set('InfoPanel', InfoPanelPlaceholder);
    ComponentRegistry.set('Editor', CodeEditorPlaceholder);
}

export const IntializeRegistryCustom = (customSetup: Map<ComponentType, Component<any>>): void => {
    customSetup.forEach((v, k) => {
        ComponentRegistry.set(k, v);
    })
}
