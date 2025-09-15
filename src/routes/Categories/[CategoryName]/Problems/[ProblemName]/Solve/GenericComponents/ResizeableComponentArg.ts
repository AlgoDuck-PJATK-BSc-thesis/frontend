import type { ComponentConfig } from "../Settings/Types/ComponentConfig";

export type ResizeAxis = 0 | 1;

export interface ResizeableComponentArg<T1, T2> {
    axis: ResizeAxis; 
    comp1: ComponentConfig<T1>;
    comp2: ComponentConfig<T2>;
    initialComp1Proportions: number
}