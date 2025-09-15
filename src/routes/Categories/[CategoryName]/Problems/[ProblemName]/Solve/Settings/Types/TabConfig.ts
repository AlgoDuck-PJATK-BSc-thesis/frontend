import type { svgArg } from "../../svg/Types/SvgIcon";
import type { ComponentConfig } from "../../GenericComponents/Types/ComponentConfig";

export interface TabConfig<P extends {}> {
    id: TabId
    label: string;
    icon: ComponentConfig<svgArg>;
    comp: ComponentConfig<P>;
};

export type TabId = 'editor';