import type { svgArg } from "$lib/types/SvgIcon";

export type ResizeAxis = 0 | 1;

export type tabSide = 0 | 1 | 2 | 3;

export interface ComponentConfig<P> {
    compId: string,
    component: string;
    options: P;
    contentWrapper?: HTMLDivElement | undefined,
    meta?: Meta,
}

export interface ResizeableComponentArg<T1, T2>{
    axis: ResizeAxis; 
    comp1: ComponentConfig<T1>;
    comp2: ComponentConfig<T2>;
    initialComp1Proportions: number;
}

export interface Meta{
    clampVal?: number,
    clamp?: ComponentConfig<any>
    label?: Label,
}

export interface Label{
    commonName: string,
    labelFor: string,
    icon?: ComponentConfig<svgArg>
}

export interface LayoutManagerComponentArgs{
    isValid: boolean,
    compId?: string,
    invalidateOtherTabsCallback?: () => void
  }

export interface WizardComponentArg{
    components: ComponentConfig<any>[],
    componentsContainer: HTMLDivElement | undefined,
    side: tabSide,
    control: ComponentConfig<any>,
    groups?: GroupData[],

}

export interface GroupData{
    groupId: string,
    label: Label,
    groupMembers: string[]
}

export interface MyTopLevelComponentArg<T>{
    component: ComponentConfig<T>
}

export interface ControlPanelArgs{
    labels: Label[],
    selectedElemId: string,
    side: number,
    groups?: GroupData[],
}