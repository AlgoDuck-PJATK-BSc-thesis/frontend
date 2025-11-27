export interface DropDownMenuOptions<K, V> {
    options: KeyValuePair<K, V>[]
    onSelectCallback: (selected: V) => void,
    groupId?: string
}

export type KeyValuePair<K, V> = {
    key: K,
    value: V
}