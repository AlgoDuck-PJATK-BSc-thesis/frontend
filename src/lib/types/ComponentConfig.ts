import type { Component } from "svelte";

export interface ComponentConfig<P> {
    component: Component<{ options: P }>;
    options: P;
}

export const createColumnConfig = <P>(component: Component<{ options: P }>, options: P): ComponentConfig<P> => ({ component, options })