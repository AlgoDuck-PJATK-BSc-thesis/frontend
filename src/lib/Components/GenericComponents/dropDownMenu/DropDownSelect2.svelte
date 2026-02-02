<script lang="ts" generics="K extends Record<string, any>, V">
	import type { Component } from "svelte";
	import { hideGroupElem, registerGroupElem, showGroupElem, type DropDownData } from "./DropDownSelectGroups.svelte";
	import type { DisplayCompArgs, DropDownMenuOptions2, KeyValuePair } from "./DropDownSelectOptions";
	import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";
	import { clickOutside } from "$lib/actions/clickOutside";

	let { options }: { options: DropDownMenuOptions2<K, V> } = $props();

	let label: K = $state(options.defaultSelected ? options.defaultSelected.key : options.options[0]?.key);

    let dropDownData: DropDownData = $state({
        groupId: options.groupId,
        isVisible: false
    } as DropDownData);

	const toggleDropDown = (): void => {
		if (!dropDownData.isVisible) {
			showGroupElem(dropDownData);
		} else {
			hideGroupElem(dropDownData!.groupId!);
		}
	};

    let selectedIndex: number | undefined = $state();

    const onSelect = (selected: KeyValuePair<K, V>, selectedIndexInternal: number): void => {
        selectedIndex = selectedIndexInternal;
        label = selected.key;
        hideGroupElem(dropDownData!.groupId!);
        options.onSelectCallback(selected.value);
    };

    let DisplayComp: Component<{ options: DisplayCompArgs<K>}> = $derived(options.displayComp)

</script>

<main use:clickOutside={() => hideGroupElem(dropDownData!.groupId!)} class="relative" {@attach () => {
		    dropDownData = registerGroupElem(dropDownData)
        }}>
        <button class="relative flex items-center rounded-t-md {!dropDownData.isVisible ? "rounded-md": ""} overflow-hidden" onclick={toggleDropDown}>
            <DisplayComp options={{isSelected: options.defaultSelected ? true : false, isPreviewed: true, content: label }}/>            
            <div class="h-full aspect-sqaure pointer-events-none absolute right-0 {dropDownData.isVisible ? "rotate-90" : ""}">
                <div class="w-full h-full p-[30%]">
                    <ChevronIconSvgNew options={{class: "w-full h-full stroke-white"}}/>
                </div>
            </div>
        </button>
        {#if dropDownData.isVisible}
            <div class="absolute max-h-40 overflow-y-scroll rounded-b-md z-999 overflow-hidden">
                {#each options.options as option, i}
                    <button onclick={() => onSelect(option, i)}>
                        <DisplayComp options={{isSelected: i === selectedIndex, isPreviewed: false, content: option.key}}/>
                    </button>
                {/each}
            </div>
        {/if}
    </main>