import type { ComponentConfigStatic } from "$lib/Components/GenericComponents/AutoCompleteInput/ComponentConfigStatic";
import type { Component } from "svelte";
import type LinkColumn from "./LinkColumn.svelte";
import type RegularColumn from "./RegularColumn.svelte";

export interface ColumnPreviewArgs {
    label: string,
}

export interface LinkPreviewColumnArgs extends ColumnPreviewArgs {
    href: string,
}

export interface PopOverColumnArgs<T extends Record<string, any>> extends ColumnPreviewArgs {
    displayComponent: Component<{ options: T }>
    getPreviewData: () => Promise<T>,
}
