<script lang="ts">
	import { goto } from "$app/navigation";
	import type { ProblemButtonArgType } from "$lib/types/problemButtonArgType";

    let { data } : { data: ProblemButtonArgType } = $props();

    let isHovered: boolean = $state(false);
    let timeoutCancellationHandle: number | undefined = $state(undefined);


    const handleMouseEnter = (e: MouseEvent  & { currentTarget: HTMLButtonElement }) : void => {
        const button: HTMLButtonElement = e.currentTarget;
        isHovered = true;
        button.style.transition = 'height 0.25s ease-out';

        timeoutCancellationHandle = setTimeout(()=>{
            button.style.height = "240px";
        }, 500);
    }

    const handleMouseLeave = (e: MouseEvent  & { currentTarget: HTMLButtonElement }) : void => {
        const button: HTMLButtonElement = e.currentTarget;
        isHovered = false;
        button.style.height = "";
        if (timeoutCancellationHandle){
            clearTimeout(timeoutCancellationHandle);
        }
    }

    const redirectToProblem = () : void => {
        goto(`Problems/${data.problem.id}/Solve`);
    }


</script>

<button class="w-full h-15 flex justify-start relative mb-1" onclick="{redirectToProblem}" onmouseenter="{handleMouseEnter}" onmouseleave="{handleMouseLeave}">
      <div class="fixed left-[-100%] z-0 w-[300%] h-15 {isHovered? 'bg-red-950/50 shadow-[0_0_5px_5px_rgba(255,0,0,0.7)] shadow-red-950/75' : 'invisible'}"></div>

    <div class="h-full z-[1000] w-[20%] pl-4 flex justify-start items-center text-center text-4xl">
        <div class="w-full h-full flex justify-center items-center {isHovered? 'bg-red-900 shadow-[0_0_5px_5px_rgba(255,0,0,0.5)] shadow-red-500/50' : 'bg-ide-bg'}">
            <span class="w-full h-full flex justify-start items-center px-[5%]">{data.action}</span>
        </div>
    </div>
    <div class="h-full z-[1000] w-[38%] {isHovered? 'bg-red-900 shadow-[0_0_5px_5px_rgba(255,0,0,0.5)] shadow-red-500/50' : 'bg-ide-bg'} flex justify-center items-center text-center text-4xl relative">
        <span class="text-6xl" >{isHovered ? '<' : '>'}</span>
        <span class="flex justify-center items-center {isHovered ? 'bg-red-900' : 'bg-ide-bg'} px-2 py-1">{data.command}</span>
        <span class="text-6xl">{isHovered ? '>' : '<'}</span>
    </div>
    <div class="h-full z-[1000] w-[42%] text-3xl flex justify-start items-center text-center pr-4">
        <div class="w-full h-full flex justify-start items-center px-[5%] {isHovered? 'bg-red-900 shadow-[0_0_5px_5px_rgba(255,0,0,0.5)] shadow-red-500/50' : 'bg-ide-bg'}">
            <span class="flex w-full justify-start items-center">{data.description}</span>
        </div>
    </div>
</button>