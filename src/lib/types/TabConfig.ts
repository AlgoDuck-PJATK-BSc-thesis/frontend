import type { ComponentConfig } from "./ComponentConfig";
import type { svgArg } from "./SvgIcon";

export interface TabConfig<P extends {}> {
    id: TabId
    label: string;
    icon: ComponentConfig<svgArg>;
    comp: ComponentConfig<P>;
};

export type TabId = 'editor';