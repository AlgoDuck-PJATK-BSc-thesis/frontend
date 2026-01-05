<script lang="ts">
	import QuestionMarkIconSvg from "$lib/svg/Toast/QuestionMarkIconSvg.svelte";


    export type ToolTipOptions = {
        tip: string,
    }
    let { options }: { options: ToolTipOptions } = $props();
    let supportDialogELem: HTMLDialogElement;
    let parentWidth: number = $state(0);

</script>

<div 
{@attach node => {
    const parentElement: HTMLElement | null = node.parentElement
    if (!parentElement) return;
    const parentElementBoundingRect: DOMRect = parentElement.getBoundingClientRect(); 
    parentWidth = parentElementBoundingRect.width;
}}
onmouseover={() => {
    supportDialogELem.show();
}}
onfocus={() => {
    supportDialogELem.show();
}}
onmouseout={() => {
    supportDialogELem.close();
}} 
onblur={() => {
    supportDialogELem.close();
}}
role="button"
class="relative inline-flex items-center justify-center"
tabindex="0">
    <QuestionMarkIconSvg options={{ class: "w-3 h-3 stroke-[#858585] stroke-[1.5] group-hover:stroke-[#cccccc]" }}/>
    <dialog class="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 p-0 m-0 bg-[#2d2d2d] border border-[#3c3c3c] rounded shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-[9999] animate-[tooltipFade_0.15s_ease] backdrop:bg-transparent before:content-[''] before:absolute before:-top-1.5 before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0 before:border-l-[6px] before:border-l-transparent before:border-r-[6px] before:border-r-transparent before:border-b-[6px] before:border-b-[#3c3c3c] after:content-[''] after:absolute after:-top-[5px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0 after:border-l-[5px] after:border-l-transparent after:border-r-[5px] after:border-r-transparent after:border-b-[5px] after:border-b-[#2d2d2d]" 
        bind:this={supportDialogELem}
        style="max-width: {parentWidth * 0.8};">
        <div class="px-3.5 py-2.5">
            <p class="m-0 font-sans text-xs leading-relaxed text-[#cccccc]">{options.tip}</p>
        </div>
    </dialog>
</div>

<style>
    @keyframes tooltipFade {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
</style>