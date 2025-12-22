import type { Component } from "svelte"
import type { ComponentConfigStatic } from "../AutoCompleteInput/ComponentConfigStatic"

export interface DropDownMenuOptions<K, V> {
    options: KeyValuePair<K, V>[]
    onSelectCallback: (selected: V) => void,
    groupId?: string
}


export interface DropDownMenuOptions2<K extends Record<string, any>, V> {
    options: KeyValuePair<K, V>[]
    onSelectCallback: (selected: V) => void,
    displayComp: Component<{ options: DisplayCompArgs<K> }>,
    groupId?: string,
}

export type DisplayCompArgs<K> = {
    isSelected: boolean,
    content: K 
}

export type KeyValuePair<K, V> = {
    key: K,
    value: V
}