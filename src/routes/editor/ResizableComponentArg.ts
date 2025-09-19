export type ResizeAxis = 0 | 1;

export type tabSide = 0 | 1 | 2 | 3;

export type ComponentType = 'SplitPanel' | 'WizardPanel' | 'TopLevelComponent' | 'GreenPanel' | 'BluePanel' | 'RedPanel' | 'PlaceholderPanel'

export interface ComponentConfig<P> {
    component: ComponentType;
    options: P;
    contentWrapper?: HTMLDivElement | undefined,
}

export interface ResizeableComponentArg<T1, T2>{
    axis: ResizeAxis; 
    comp1: ComponentConfig<T1>;
    comp2: ComponentConfig<T2>;
    initialComp1Proportions: number
}

export interface WizardComponentArg{
    components: ComponentConfig<{}>[];
    componentsContainer: HTMLDivElement | undefined;
    side: tabSide;
}

export interface MyTopLevelComponentArg<T>{
    component: ComponentConfig<T>
}
