<script lang='ts'>
    import CodeObjectIconSvg from "$lib/svg/EditorComponentIcons/CodeObjectIconSvg.svelte";
    import type { MethodRecommendation, RecommendationDisplayCompArgs } from "../TestCase";

    let { options }: { options: RecommendationDisplayCompArgs<MethodRecommendation> } = $props()
</script>

<!-- Compact selected display variant - no hover effects, streamlined layout -->
<div class="w-full flex items-center justify-between px-3 py-1.5 gap-3">
    <div class="flex flex-row gap-3 items-center min-w-0">
        <CodeObjectIconSvg options={{ class: "w-4 h-4 stroke-[#b180d7] stroke-[1] shrink-0"}}/>
        <div class="flex flex-row items-center gap-2 font-mono text-sm overflow-hidden">
            <span class="font-medium text-[#dcdcaa] whitespace-nowrap">{options.content.methodName}</span>
            <span class="text-xs text-[#858585] whitespace-nowrap overflow-hidden text-ellipsis">
                ({#each options.content.functionParams as param, i}{#if i > 0}, {/if}<span class="text-[#4ec9b0]">{param.type}</span>{/each})
                <span class="px-1">=&gt;</span>
                <span class="text-[#4ec9b0]">{options.content.returnType}</span>
            </span>
        </div>
    </div>
</div>