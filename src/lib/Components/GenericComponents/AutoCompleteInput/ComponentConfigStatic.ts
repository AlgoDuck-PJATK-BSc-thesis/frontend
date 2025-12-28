import type { Component } from "svelte"

export interface ComponentConfigStatic<TData extends Record<string, any>> {
    component: Component<{ options: TData }>
    options: TData
}