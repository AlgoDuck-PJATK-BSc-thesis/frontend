<svelte:head>
	<title>Problems – Beetcode</title>
</svelte:head>

<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
  
	import NonProblemButton from "./NonProblemButton.svelte";
	import ProblemButton from "./ProblemButton.svelte";
	import type { Category } from "$lib/types/Category";



  let { data } : { data: Category } = $props();

  let currHour: number = $state(0);
  let currMinute: number = $state(0);

  let raf: number;

  const updateTime = () : void => {
    const currDate: Date = new Date();
    currHour = currDate.getHours();
    currMinute = currDate.getMinutes();
    raf = requestAnimationFrame(updateTime);
  }

  const returnToCategories = () : void => {
    goto("/Categories");
  }

  onMount(()=>{
    // TODO super inefficient
    raf = requestAnimationFrame(updateTime)
    return () => {
      cancelAnimationFrame(raf);
    }
  });

</script>


<main class="flex bg-ide-bg h-[94vh] w-full relative justify-center items-center" style="font-family: var(--font-blockblueprint);">
  <div class="w-30 h-10 bg-ide-bg absolute top-[1.25%] right-[20%] flex justify-center items-center text-center text-3xl">
    <span>{`${currHour < 10 ? `0${currHour}` : currHour}:${currMinute < 10 ? `0${currMinute}` : currMinute}`}</span>
  </div>
  <div class="w-[70%] h-[95%] border-4 shadow-[0_0_5px_3px_rgba(255,255,255,0.5)] shadow-white-500/50">
    <div class="w-full h-[93%] overflow-y-scroll relative">
      <div class="bg-transparent pointer-events-none z-[9999] absolute top-0 h-full w-[20%] left-0 border-r-4 shadow-[0_0_5px_3px_rgba(255,255,255,0.5)]"></div>
      <div class="bg-transparent pointer-events-none z-[9999] absolute top-0 h-full w-[38%] left-[20%]  border-r-4 shadow-[0_0_5px_3px_rgba(255,255,255,0.5)]"></div>
      <div class="bg-transparent pointer-events-none z-[9999] absolute top-0 h-full w-[42%] left-[38%] "></div>
      <div class="w-full h-full flex flex-col justify-start">
        <div class="flex flex-col justify-start py-8">
          <NonProblemButton data={{action: "../", command: "RET", description: "directory: GO UP", onClick: returnToCategories}}/>
          <NonProblemButton data={{action: "SELECT-RANDOM", command: "RAND", description: "coin-toss: SELECT AND OPEN RANDOM EXERCISE", onClick: ()=>{}}}/>
        </div>
        <div class="w-[58%] h-1 bg-white shadow-[0_0_5px_3px_rgba(255,255,255,0.5)]"></div>

        <div class="flex flex-col justify-start py-8 overflow-scroll">
          {#each data.problems as problem}
            {#each [...Array(15).keys()] as i}
              <ProblemButton data={{action: problem.id.substring(0, 8), command: problem.name.replaceAll(" ", "-"), description: problem.synopsis.toUpperCase(), problem: problem}}/>         
            {/each}
          {/each}        
        </div>
      </div>
    </div>
    
    <div class="w-full h-[6%] border-t-4 shadow-[0_0_5px_3px_rgba(255,255,255,0.5)] shadow-white-500/50 flex justify-start items-center p-8 text-4xl">
      {`C:\\{USER_NAME}\\${data.name}`}
    </div>
  </div>
  <div class="w-80 h-10 absolute bottom-[1.25%] right-[20%] bg-ide-bg flex justify-center items-center text-center text-3xl">
    <span>{`beet-cat-v_0.1.271`}</span>
  </div>
</main>