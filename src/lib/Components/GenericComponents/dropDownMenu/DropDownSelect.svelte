<script lang="ts" generics="K, V">
	import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
	import { hideGroupElem, registerGroupElem, showGroupElem, type DropDownData } from "./DropDownSelectGroups.svelte";
	import type { DropDownMenuOptions, KeyValuePair } from "./DropDownSelectOptions";

	let { options }: { options: DropDownMenuOptions<K, V> } = $props();

	let label: K | undefined = $state(options.options?.at(0)?.key);

	let dropDownMenuContents: HTMLDivElement;
	let chevronIcon: HTMLDivElement;

	let dropDownData: DropDownData | undefined = $state()
	const targetOptionHeight: string = `${Math.min(800, options.options.length * 100)}%`;

	let isDropDownMenuShown: boolean = $state(false);
	const toggleDropDown = (): void => {
		if (!isDropDownMenuShown) {
			isDropDownMenuShown = true;
			showGroupElem(dropDownData!.groupId!, dropDownData!.menuId!, targetOptionHeight, () => { isDropDownMenuShown = false; });
		} else {
			hideGroupElem(dropDownData!.groupId!);
		}
	};

	const onSelect = (selected: KeyValuePair<K, V>): void => {
		label = selected.key;
		toggleDropDown();
		options.onSelectCallback(selected.value);
	};

</script>

<main {@attach () => {dropDownData = registerGroupElem(options.groupId, {dropDown: dropDownMenuContents, chevron: chevronIcon})}} class="w-full h-full text-text-alt bg-ide-card rounded-md relative">
	<button
		onclick={toggleDropDown}
		class="w-full h-full flex justify-between px-4 border-2 border-accent/10 rounded-md py-2 items-center absolute top-0 hover:cursor-pointer"
	>
		<span class="text-text flex justify-start items-center overflow-hidden">{label}</span>
		<div bind:this={chevronIcon} class="h-[33%] sm:h-[50%] aspect-square">
			<ChevronIconSvg options={{ class: "w-full h-full stroke-text" }} />
		</div>
	</button>
	<div
  	bind:this={dropDownMenuContents}
  	class="w-full h-0 bg-ide-card   rounded-md absolute overflow-hidden {isDropDownMenuShown
  	  ? 'py-1 px-0.5 z-110 border-2 border-accent/10'
  	  : ''} grid grid-cols-1 overflow-x-hidden gap-y-1"
	>
		{#each options.options as selectionOption, i}
			<button
				class="rounded-sm hover:cursor-pointer {selectionOption === label
					? 'bg-ide-card'
					: ''} hover:bg-ide-card/10"
				onclick={() => onSelect(selectionOption)}
			>
				<span class="w-full h-full px-4 flex-nowrap flex justify-start items-center text-text overflow-hidden"
					>{selectionOption.key}</span
				>
			</button>
		{/each}
	</div>
</main>
