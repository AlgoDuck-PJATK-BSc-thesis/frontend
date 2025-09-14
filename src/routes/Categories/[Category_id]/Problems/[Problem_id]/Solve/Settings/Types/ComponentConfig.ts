import type { Component } from "svelte";

export interface ComponentConfig<P> {
    component: Component<{ options: P }>;
    options: P;
}