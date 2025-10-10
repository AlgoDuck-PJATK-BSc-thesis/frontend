const registeredGroups: Record<string, Record<string, GroupElements>> = {};
const groupHighlightedMember: Record<string, GroupElements | undefined> = {};

let hideCallbacks: Record<string, () => void> = {};

export interface GroupElements {
    dropDown: HTMLDivElement,
    chevron: HTMLDivElement 
}

export const hideGroupElem = ( groupId: string ): void => {
    if (groupHighlightedMember[groupId]) {
        const elem: GroupElements = groupHighlightedMember[groupId];
		elem.dropDown.style.top = '';
		elem.dropDown.style.height = '';
		elem.chevron.style.rotate = '';

        if (hideCallbacks[groupId]){
            hideCallbacks[groupId]?.();
        }else{
            console.log("no callback");
        }
        groupHighlightedMember[groupId] = undefined;
    }
}

export interface DropDownData{
    groupId: string,
    menuId: string,
}

export const registerGroupElem = (groupId: string | undefined, elements: GroupElements): DropDownData => {
    const gid: string = groupId ?? generateSynthGroupid();
    const ddId: string = generateSynthName();
    if (!registeredGroups[gid]){
        registeredGroups[gid] = {};
        registeredGroups[gid] = {};
    }
    registeredGroups[gid][ddId] = elements;
    return { groupId: gid, menuId: ddId};
}

export const showGroupElem = ( groupId: string, elementId: string, targetHeight: string, onHide: () => void ): void => {
    hideGroupElem(groupId);
    const elem: GroupElements = registeredGroups[groupId][elementId];
    elem.dropDown.style.top = '110%';
    elem.dropDown.style.height = targetHeight;
    elem.chevron.style.rotate = '90deg';
    groupHighlightedMember[groupId] = elem;
    hideCallbacks[groupId] = onHide;

}

export const generateSynthGroupid = () : string => {
    return `group-${groupCounter++}`
}

export const generateSynthName = () : string => {
    return `dd-${dropDownCounter++}`;
}

let groupCounter: number = 0;
let dropDownCounter = 0;