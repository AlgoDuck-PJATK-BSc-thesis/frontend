import type { Component } from "svelte"

export interface ComponentConfigStatic<TData extends Record<string, any>> {
    component: Component<{ options: TData, errors?: Record<string, any>, rootElement?: HTMLElement}>
    options: TData
    rootElement?: HTMLElement
}