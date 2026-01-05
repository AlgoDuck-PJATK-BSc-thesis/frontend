<script lang='ts'>
    import CodeObjectIconSvg from "$lib/svg/EditorComponentIcons/CodeObjectIconSvg.svelte";
    import type { FunctionParam, RecommendationDisplayCompArgs } from "../TestCase";

    let { options }: { options: RecommendationDisplayCompArgs<FunctionParam> } = $props()
</script>

<!-- Compact selected display variant - no hover effects, streamlined layout -->
<div class="w-full flex items-center gap-2.5 px-3 py-1.5">
    <CodeObjectIconSvg options={{ class: "w-4 h-4 stroke-[#b180d7] stroke-[1] shrink-0"}}/>
    <span class="font-mono text-sm font-medium text-[#9cdcfe] whitespace-nowrap overflow-hidden text-ellipsis">{options.content.name}</span>
    <span class="font-mono text-[11px] text-[#4ec9b0] bg-[#4ec9b0]/10 px-2 py-0.5 rounded border border-[#4ec9b0]/20">{options.content.type}</span>
</div>