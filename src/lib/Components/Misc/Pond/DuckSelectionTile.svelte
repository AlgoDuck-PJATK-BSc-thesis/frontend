<script lang="ts">
	import ThreeDotIconSvg from "$lib/svg/EditorComponentIcons/ThreeDotIconSvg.svelte";
	import type { OwnedDuck, UsedDuckDto } from "./duckTypes";

    let { options }: { options: { duck: UsedDuckDto, onclick: ((duck: OwnedDuck) => Promise<void>) } } = $props();

	let isContextMenuVisible: boolean = $state(false);
	let contextMenuRef: HTMLDivElement | null = $state(null);
	let toggleButtonRef: HTMLButtonElement | null = $state(null);

	// $inspect(options);
	$effect(() => {
		if (!isContextMenuVisible) return;

		function handleClickOutside(event: MouseEvent) {
			const target = event.target as Node;
			
			if (
				contextMenuRef && !contextMenuRef.contains(target) &&
				toggleButtonRef && !toggleButtonRef.contains(target)
			) {
				isContextMenuVisible = false;
			}
		}

		setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 0);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="w-full aspect-square flex items-center justify-center p-[8%] relative rounded-[25%] bg-blue-500">
	<button bind:this={toggleButtonRef}
		onclick={() => { isContextMenuVisible = !isContextMenuVisible }}
		class="absolute hover:bg-amber-600 rounded-[20%] w-[20%] h-[20%] right-[10%] top-[10%]">
		<ThreeDotIconSvg options={{ class: "w-full h-full stroke-black stroke-[2]" }} />
	</button>
	<img src={`https://d3018wbyyxg1xc.cloudfront.net/Ducks/Outfits/duck-${options.duck.itemId}.png`} alt="duck">
	{#if isContextMenuVisible}
		<div bind:this={contextMenuRef}
			class="w-50 h-25 absolute z-500 top-[30%] right-[10%] mt-2 flex flex-col rounded-lg bg-blue-400">
			<div class="p-1">
				<button
					class="w-full h-full py-3 hover:bg-blue-900 rounded-md"
					onclick={async () => { 
                        await options.onclick(options.duck);
                        isContextMenuVisible = false; }
                    }>
					{!options.duck.isSelectedForPond ? "Select" : "Deselect"}
				</button>
			</div>
		</div>
	{/if}
</div>