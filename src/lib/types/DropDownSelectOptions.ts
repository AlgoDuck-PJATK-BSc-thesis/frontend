export interface DropDownMenuOptions {
    label: string,
    options: string[],
    onSelectCallback: (selected: string) => void,
    groupId?: string
}