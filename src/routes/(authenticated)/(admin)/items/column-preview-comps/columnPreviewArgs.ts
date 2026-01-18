import type { ComponentConfigStatic } from "$lib/Components/GenericComponents/AutoCompleteInput/ComponentConfigStatic";
import type { Component } from "svelte";
import type LinkColumn from "./LinkColumn.svelte";
import type RegularColumn from "./RegularColumn.svelte";
import type { StandardResponseDto } from "$lib/api/apiCall";

export interface ColumnPreviewArgs {
    label: string,
}

export interface LinkPreviewColumnArgs extends ColumnPreviewArgs {
    href: string,
}

export interface PopOverColumnArgs<T extends Record<string, any>> extends ColumnPreviewArgs {
    displayComponent: Component<{ options: any }>
    getPreviewData: () => Promise<StandardResponseDto<T>>,
}

export type UserPreviewDto = {
    id: string,
    username: string,
    email: string,
    selectedAvatar: string,
    itemCreatedCount: number
}
