<script lang="ts">
	import Chevron from '../svg/chevron.svelte';
	import type { DropDownMenuOptions } from './Types/DropDownSelectOptions';

	let { options }: { options: DropDownMenuOptions } = $props();

	let label = $state(options.label);

	let dropDownMenuContents: HTMLDivElement;
	let chevronIcon: HTMLDivElement;

	const targetOptionHeight: string = `${Math.min(800, options.options.length * 100)}%`;

	let isDropDownMenuShown: boolean = $state(false);
	const toggleDropDown = (): void => {
		if (!isDropDownMenuShown) {
			isDropDownMenuShown = true;
			dropDownMenuContents.style.top = '110%';
			dropDownMenuContents.style.height = targetOptionHeight;
			chevronIcon.style.rotate = '90deg';
		} else {
			isDropDownMenuShown = false;
			dropDownMenuContents.style.top = '';
			dropDownMenuContents.style.height = '';
			chevronIcon.style.rotate = '';
		}
	};

	const onSelect = (selected: string): void => {
		label = selected;
		toggleDropDown();
		options.onSelectCallback(selected);
	};
</script>

<main class="w-full h-full bg-ide-card rounded-md relative">
	<button
		onclick={toggleDropDown}
		class="w-full h-full flex justify-between px-4 py-2 items-center absolute top-0 hover:cursor-pointer"
	>
		<span class="text-ide-text-secondary">{label}</span>
		<div bind:this={chevronIcon} class="h-[33%] aspect-square">
			<Chevron args={{ color: '#FFFFFF' }} />
		</div>
	</button>
	<div
  	bind:this={dropDownMenuContents}
  	class="w-full h-0 bg-ide-card rounded-md absolute {isDropDownMenuShown
  	  ? 'p-1 z-110'
  	  : ''} grid grid-cols-1 overflow-x-hidden overflow-y-scroll gap-y-1"
	>
		{#each options.options as selectionOption}
			<button
				class="rounded-sm hover:cursor-pointer {selectionOption === label
					? 'bg-ide-dcard'
					: ''} hover:bg-ide-dcard"
				onclick={() => onSelect(selectionOption)}
			>
				<span class="w-full h-full px-4 flex justify-start items-center text-ide-text-primary"
					>{selectionOption}</span
				>
			</button>
		{/each}
	</div>
</main>
