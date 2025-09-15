<script lang="ts">
	import type { NonProblemButtonArgType } from "./nonProblemButtonArgType";

    let { data } : { data: NonProblemButtonArgType } = $props();

    let isHovered: boolean = $state(false);


    const handleMouseEnter = (e: MouseEvent  & { currentTarget: HTMLButtonElement }) : void => {
        const button: HTMLButtonElement = e.currentTarget;
        isHovered = true;
    }

    const handleMouseLeave = (e: MouseEvent  & { currentTarget: HTMLButtonElement }) : void => {
        const button: HTMLButtonElement = e.currentTarget;
        isHovered = false;
    }


</script>

<button class="w-full h-15 {isHovered? 'bg-red-900 shadow-[0_0_5px_5px_rgba(255,0,0,0.5)] shadow-red-500/50' : 'bg-[#242424]'} flex justify-start relative mb-1" onclick="{data.onClick}" onmouseenter="{handleMouseEnter}" onmouseleave="{handleMouseLeave}">
    <div class="h-full w-[20%] p-4 border-r-4 border-white flex justify-start items-center text-center text-4xl">
        <span>{data.action}</span>
    </div>
    <div class="h-full w-[18%] border-r-4  flex justify-center items-center text-center text-4xl relative">
        <div class="w-[95%] h-0.5 bg-white absolute z-10"></div>
        <span class="absolute z-20 {isHovered ? 'bg-red-900' : 'bg-[#242424]'} px-2 py-1">&lt;{data.command}&gt;</span>
    </div>
    <div class="h-full w-[62%] text-3xl flex justify-start items-center text-center px-10">
        <span>{data.description}</span>
    </div>
</button>