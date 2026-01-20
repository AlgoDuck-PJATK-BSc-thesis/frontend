<script lang="ts">
	import FileIconSvg from "$lib/svg/EditorComponentIcons/FileIconSvg.svelte";
	import type { FileTreeLeafType } from "$lib/types/FileTreeTypes";


	let { leaf }: { leaf: FileTreeLeafType } = $props();
</script>

<button
	class="m-1 text-text-secondary overflow-hidden w-full gap-3 h-8 flex justify-start items-center text-center px-4 rounded-sm hover:cursor-pointer active:bg-ide-card active:border-ide-accent active:shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]"
	style={`padding-left: ${16 + 8 * leaf.depth}px;`}
	onclick={leaf.selectObject}
>
	<div class="h-[40%] aspect-square text-center select-none m-1">
		<!-- <Chevron args={{ color: '#FF13F0' }} /> -->
	</div>
	<FileIconSvg options={{class: "h-[70%] aspect-square stroke-ide-text-secondary"}}/>
	<span class="px-2 flex justify-center text-ide-text-secondary items-center">{leaf.label}</span>
</button>
