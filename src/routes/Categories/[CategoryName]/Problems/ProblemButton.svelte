<script lang="ts">
	import { goto } from "$app/navigation";
	import type { ProblemButtonArgType } from "./problemButtonArgType";

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

<button class="w-full h-15 {isHovered? 'bg-red-900 shadow-[0_0_5px_5px_rgba(255,0,0,0.5)] shadow-red-500/50' : 'bg-[#242424]'} flex flex-col justify-start overflow-hidden mb-1" onmouseenter="{handleMouseEnter}" onmouseleave="{handleMouseLeave}" onclick="{redirectToProblem}">
    <div class="w-full h-15 flex justify-start relative">
        <div class="h-full w-[20%] p-4 border-r-4 border-white flex justify-start items-center text-center text-4xl">
            <span>{data.action}</span>
        </div>
        <div class="h-full w-[18%] border-r-4  flex justify-center items-center text-center text-4xl relative">
        <div class="w-[95%] h-0.5 bg-white absolute z-10"></div>
        <span class="absolute z-20 {isHovered ? 'bg-red-900' : 'bg-[#242424]'} px-2 py-1">&lt;{data.command}&gt;</span>
            </div>
        <div class="h-full w-[62%] text-3xl flex justify-start items-center text-center px-10">
            <span>{`problem: ${data.description}`}</span>
        </div>
    </div>
    <div class="w-full h-45 bg-[#242424] border-4 border-white flex justify-start relative text-start text-xl">
        <div class="w-[70%] h-full border-r-4 border-white flex flex-col justify-start overflow-y-scroll p-3">
            <div>
                <span>LAST-ATTEMPT: N\A</span>
            </div>
        </div>
        <div class="w-[30%] h-full flex flex-col justify-start p-3">
            <div>
                <span>LAST-ATTEMPT: N\A</span>
            </div>
            <div>
                <span>OWNED-STARS: N\A</span>
            </div>
        </div>
    </div>

</button>