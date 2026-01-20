const registeredGroups: Record<string, Record<string, DropDownData>> = {};
const groupHighlightedMember: Record<string, DropDownData | undefined> = {};

let hideCallbacks: Record<string, () => void> = {};

export interface GroupElements {
    dropDown?: HTMLDivElement,
    chevron: HTMLDivElement 
}

export const hideGroupElem = ( groupId: string ): void => {
    if (groupHighlightedMember[groupId]) {
        const elem: DropDownData = groupHighlightedMember[groupId];
        if (elem.isVisible){
            elem.isVisible = false;
        }
        groupHighlightedMember[groupId] = undefined;
    }
}

export interface DropDownData{
    groupId?: string;
    dropDownId: string,
    isVisible: boolean;
}

export const registerGroupElem = (data: DropDownData): DropDownData => {
    data.groupId ??= generateSynthGroupid();
    data.dropDownId ??= generateSynthName();
    if (!registeredGroups[data.groupId]){
        registeredGroups[data.groupId] = {};
    }
    registeredGroups[data.groupId][data.dropDownId] = data;
    return data;
}

export const showGroupElem = ( data: DropDownData ): void => {
    hideGroupElem(data.groupId!);
    const elem: DropDownData = registeredGroups[data.groupId!][data.dropDownId!];
    elem.isVisible = true;
    groupHighlightedMember[data.groupId!] = elem;
}

export const generateSynthGroupid = () : string => {
    return `group-${groupCounter++}`
}

export const generateSynthName = () : string => {
    return `dd-${dropDownCounter++}`;
}

let groupCounter: number = 0;
let dropDownCounter = 0;