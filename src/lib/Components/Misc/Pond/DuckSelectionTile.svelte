<script lang="ts">
	import ThreeDotIconSvg from "$lib/svg/EditorComponentIcons/ThreeDotIconSvg.svelte";
	import type { OwnedDuck, UsedDuckDto } from "./duckTypes";

	let { options }: { options: { duck: UsedDuckDto, onclick: ((duck: OwnedDuck) => Promise<void>) } } = $props();

	let isContextMenuVisible: boolean = $state(false);
	let contextMenuRef: HTMLDivElement | null = $state(null);
	let toggleButtonRef: HTMLButtonElement | null = $state(null);

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
	let mainElement: HTMLDivElement | undefined = $state();
</script>

<div bind:this={mainElement} class="w-full aspect-square flex items-center justify-center p-[8%] relative rounded-[25%]">
	<button bind:this={toggleButtonRef}
		onclick={() => { isContextMenuVisible = !isContextMenuVisible }}
		class="absolute hover:bg-amber-700/50 rounded-[20%] w-[20%] h-[20%] right-[10%] top-[10%] transition-colors">
		<ThreeDotIconSvg options={{ class: "w-full h-full stroke-amber-900 stroke-[2]" }} />
	</button>
	<img src={`https://d3018wbyyxg1xc.cloudfront.net/duck/${options.duck.itemId}/Sprite.png`} alt="duck">
	{#if isContextMenuVisible}
		<div {@attach node => {
			if (!mainElement || !mainElement.parentElement) return;
			$effect(() => {
				const nodeBoundingRect: DOMRect = node.getBoundingClientRect();
				if (nodeBoundingRect.left < 0) {
					node.style.left = '0';
					node.style.right = 'auto';
				}
				else if (nodeBoundingRect.right > window.innerWidth) {
					node.style.right = '0';
					node.style.left = 'auto';
				}
			})
		}} bind:this={contextMenuRef}
			class="absolute z-500 top-[30%] right-[10%] mt-2 rounded-lg bg-[#f5e6c8] border-3 border-amber-800 shadow-lg">
			<div class="p-1">
				<button
					class="px-3 py-1.5 w-full text-amber-900 font-medium hover:bg-amber-700/30 rounded-md transition-colors text-sm"
					onclick={async () => { 
						await options.onclick(options.duck);
						isContextMenuVisible = false; 
					}}>
					{!options.duck.isSelectedForPond ? "Select" : "Deselect"}
				</button>
			</div>
		</div>
	{/if}
</div>