<script lang='ts'>
	import CodeObjectIconSvg from "$lib/svg/EditorComponentIcons/CodeObjectIconSvg.svelte";
	import type { FunctionParam, RecommendationDisplayCompArgs } from "../TestCase";

    let { options }: { options: RecommendationDisplayCompArgs<FunctionParam> } = $props()
</script>

<button
    onmousedown={() => {
        options.onSelect(options.content)
    }}
    class="w-full flex items-center gap-2.5 px-3 py-2 bg-transparent border-none cursor-pointer text-left transition-colors hover:bg-[#37373d] focus:bg-[#0e639c] focus:outline-none group">
    <CodeObjectIconSvg options={{ class: "w-5 h-5 stroke-[#b180d7] stroke-[1]"}}/>

    <div class="flex-1 flex items-center min-w-0 overflow-hidden">
        <span class="font-mono text-sm font-medium text-[#9cdcfe] whitespace-nowrap overflow-hidden text-ellipsis group-focus:text-white">{options.content.name}</span>
    </div>
    <div class="flex-shrink-0">
        <span class="font-mono text-[11px] text-[#4ec9b0] bg-[#4ec9b0]/10 px-2 py-0.5 rounded border border-[#4ec9b0]/20 group-focus:text-white group-focus:bg-white/10 group-focus:border-white/20">{options.content.type}</span>
    </div>
</button>