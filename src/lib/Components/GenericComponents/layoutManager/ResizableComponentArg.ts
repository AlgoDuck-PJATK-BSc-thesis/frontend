import type { svgArg } from "$lib/types/SvgIcon";

export type ResizeAxis = 0 | 1;

export type tabSide = 0 | 1 | 2 | 3;

export interface ComponentConfig<P extends {}> {
    compId: string,
    component: string;
    options: P;
    contentWrapper?: HTMLDivElement | undefined,
    meta?: Meta,
}

export interface ResizeableComponentArg<T1 extends {}, T2 extends {}>{
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
    components: ComponentConfig<MyTopLevelComponentArg<any>>[],
    componentsContainer?: HTMLDivElement,
    side: tabSide,
    control: ComponentConfig<ControlPanelArgs>,
    groups?: GroupData[],

}

export interface GroupData{
    groupId: string,
    label: Label,
    groupMembers: string[]
}

export interface MyTopLevelComponentArg<T extends {}>{
    component: ComponentConfig<T>
}

export interface ControlPanelArgs{
    labels: Label[],
    selectedElemId?: string,
    controlCallbacks?: Record<string, (...args: any[]) => any>,
    side: number,
    groups?: GroupData[],
    components: ComponentConfig<MyTopLevelComponentArg<any>>[]

}


export interface ControlCallbacks {
    insert?: (InsertData: InsertData) => void,
    select?: (selected: string) => void,
    remove?: (compId: string) => void,
    swap?: (comp1Index: number, comp2Index: number ) => void,
    contains?: (compId: string) => boolean,
    addInsertedComponentToRoot?: (compId: string) => boolean,
}

export type InsertData = {
    compId: string,
    compType: string, 
    compCommonName?: string
    compArgs?: object
}

export interface ControlPanelArgsBuild extends ControlPanelArgs{
    removeComp: (compId: string) => void
    swapCompenets: (comp1Index: number, comp2Index: number ) => void
}