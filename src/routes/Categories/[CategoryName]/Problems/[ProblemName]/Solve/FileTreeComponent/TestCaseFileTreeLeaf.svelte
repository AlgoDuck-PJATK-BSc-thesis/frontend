<script lang="ts">
	import type { FileTreeLeafType } from './FileTreeTypes';

	let { leaf }: { leaf: FileTreeLeafType } = $props();
</script>

<button
	class="h-8 w-full overflow-hidden flex m-1 justify-start items-center text-center pr-4 rounded-sm hover:cursor-pointer active:bg-ide-card active:border-ide-accent active:shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]"
	style={`padding-left: ${16 + 8 * leaf.depth}px;`}
	onclick={leaf.selectObject}
>
	<div class="h-[40%] aspect-square"></div>
	<span class="px-2 flex justify-center items-center">{leaf.label}</span>
</button>
