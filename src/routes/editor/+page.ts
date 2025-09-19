import type { PageLoad } from "./$types";
import { ComponentRegistry } from "./ComponentRegistry";
import ResizableComponent from "./ResizeableComponent.svelte";
import WizardComponent from "./WizardComponent.svelte";
import TopLevelComponent from "./TopLevelComponent.svelte";
import PlaceholderComponent from "./Colors/PlaceholderComponent.svelte";
import GreenComponent from "./Colors/GreenComponent.svelte";
import BlueComponent from "./Colors/BlueComponent.svelte";
import RedComponent from "./Colors/RedComponent.svelte";

import Terminal from "../categories/[CategoryName]/Problems/[ProblemName]/Solve/Terminal.svelte";
import TestCases from "../categories/[CategoryName]/Problems/[ProblemName]/Solve/TestCases.svelte";
import InfoPanel from "../categories/[CategoryName]/Problems/[ProblemName]/Solve/Ide/InfoPanel.svelte";

export const load: PageLoad = async ({ params, fetch }) => {

    ComponentRegistry.set('SplitPanel', ResizableComponent);
    ComponentRegistry.set('WizardPanel', WizardComponent);
    ComponentRegistry.set('TopLevelComponent', TopLevelComponent); 
    ComponentRegistry.set('PlaceholderPanel', PlaceholderComponent);
    ComponentRegistry.set('GreenPanel', Terminal);
    ComponentRegistry.set('BluePanel', TestCases);
    ComponentRegistry.set('RedPanel', InfoPanel);

    return {
        hideHeader: true
    };
}