<svelte:head>
	<title>Problems – Beetcode</title>
</svelte:head>

<script lang="ts">
	import { onMount } from "svelte";
	import NonProblemButton from "./NonProblemButton.svelte";
	import ProblemButton from "./ProblemButton.svelte";
	import { goto } from "$app/navigation";
	import type { Category } from "./proxy+page";


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
  });

</script>

<main class="flex h-[94vh] w-full relative overflow-hidden justify-center items-center" style="font-family: var(--font-blockblueprint);">
  <div class="w-30 h-10 absolute top-[1.25%] right-[20%] bg-[var(--color-bg)] flex justify-center items-center text-center text-3xl">
    <span>{`${currHour < 10 ? `0${currHour}` : currHour}:${currMinute < 10 ? `0${currMinute}` : currMinute}`}</span>
  </div>
  <div class="w-[70%] h-[95%] border-4 shadow-[0_0_5px_3px_rgba(255,255,255,0.5)] shadow-white-500/50">
    <div class="w-full h-[94%] overflow-x-hidden overflow-y-scroll py-7 px-3">
      <NonProblemButton data={{action: "../", command: "RET", description: "directory: GO UP", onClick: returnToCategories}}/>
      <NonProblemButton data={{action: "SELECT-RANDOM", command: "RAND", description: "coin-toss: SELECT AND OPEN RANDOM EXERCISE", onClick: ()=>{}}}/>
      {#each data.problems as problem}
        <ProblemButton data={{action: problem.id.substring(0, 8), command: problem.name.replaceAll(" ", "-"), description: problem.synopsis.toUpperCase(), problem: problem}}/>         
      {/each}
    </div>
    
    <div class="w-full h-[6%] border-t-4 shadow-[0_0_5px_3px_rgba(255,255,255,0.5)] shadow-white-500/50 flex justify-start items-center p-8 text-4xl">
      {`C:\\{USER_NAME}\\${data.name}`}
    </div>
  </div>
  <div class="w-80 h-10 absolute bottom-[1.25%] right-[20%] bg-[var(--color-bg)] flex justify-center items-center text-center text-3xl">
    <span>{`beet-cat-v_0.1.271`}</span>
  </div>
</main>