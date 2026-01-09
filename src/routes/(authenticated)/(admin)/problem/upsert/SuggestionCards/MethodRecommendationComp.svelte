<script lang='ts'>
	import CodeObjectIconSvg from "$lib/svg/EditorComponentIcons/CodeObjectIconSvg.svelte";
    import type { MethodRecommendation, RecommendationDisplayCompArgs } from "../TestCase";

    let { options }: { options: RecommendationDisplayCompArgs<MethodRecommendation> } = $props()
</script>

<button
    onmousedown={() => {
        options.onSelect(options.content)
    }}
    class="method-item w-full flex items-center justify-between px-3 py-2 gap-3 hover:cursor-pointer">
    <div class="flex flex-row gap-4 items-center">
        <CodeObjectIconSvg options={{ class: "w-5 h-5 stroke-[#b180d7] stroke-[1]"}}/>
        <div class="flex flex-col items-start gap-0.5 overflow-hidden">
            <span class="font-mono text-sm font-medium text-[#dcdcaa] whitespace-nowrap overflow-hidden px-1">{options.content.methodName}</span>
            <div class="flex flex-row font-mono text-xs text-[#858585] overflow-hidden whitespace-pre">
                <span>(</span>
                {#each options.content.functionParams as param, i}
                    {#if i > 0}
                        <span>, </span>
                    {/if}
                    <span class="text-[#4ec9b0]">{param.type}</span>
                {/each}
                <span>)</span>
                <span class="px-1" > =&gt; </span> <!-- px-1 since apparantly whitespace-pre does not in fact do sh*t -->
                <span class="text-[#4ec9b0] whitespace-normal"> {options.content.returnType}</span>
            </div>
        </div>
    </div>
    <div class="flex flex-row gap-1 shrink-0 font-mono text-xs text-[#858585]">
        {#if options.content.accessModifier}
            <span class="text-[#569cd6] bg-[#2d2d2d] px-1 py-2 border border-[#3c3c3c]">{options.content.accessModifier}</span>
        {/if}
        {#each options.content.modifiers as modifier}
            <span class="bg-[#2d2d2d] px-1 py-2 border border-[#3c3c3c] ">{modifier}</span>
        {/each}
    </div>
</button>