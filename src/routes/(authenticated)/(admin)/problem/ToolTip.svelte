<script lang="ts">
	import QuestionMarkIconSvg from "$lib/svg/Toast/QuestionMarkIconSvg.svelte";
	import { fade, fly } from "svelte/transition";


    export type ToolTipOptions = {
        tip: string,
    }
    let { options }: { options: ToolTipOptions } = $props();
    let parentWidth: number = $state(0);
    let isVisible: boolean = $state(false);
</script>

<div 
{@attach node => {
    const parentElement: HTMLElement | null = node.parentElement
    if (!parentElement) return;
    const parentElementBoundingRect: DOMRect = parentElement.getBoundingClientRect(); 
    parentWidth = parentElementBoundingRect.width;
}}
onmouseover={() => {
isVisible = true;
}}
onfocus={() => {
    isVisible = true;
}}
onmouseout={() => {
    isVisible = false;
}} 
onblur={() => {
    isVisible = false;
}}
role="button"
class="relative inline-flex items-center justify-center"
tabindex="0">
    <QuestionMarkIconSvg options={{ class: "w-3 h-3 stroke-[#858585] stroke-[1.5] group-hover:stroke-[#cccccc]" }}/>
    {#if isVisible}
        <div 
            transition:fly={{ y: -15, opacity: 0.1 }} 
            class="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 p-0 m-0 bg-[#2d2d2d] border border-[#3c3c3c] z-[9999] w-max rounded-md" 
            style="max-width: {parentWidth * 0.8}px;">
            <div class="px-3.5 py-2.5">
                <p class="m-0 font-sans text-xs leading-relaxed text-[#cccccc]">{options.tip}</p>
            </div>
    </div>
    {/if}
</div>
