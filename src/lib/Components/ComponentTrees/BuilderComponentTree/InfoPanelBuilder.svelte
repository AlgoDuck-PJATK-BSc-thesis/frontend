<script lang="ts">
	import type { InfoPanelComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import InfoPanelIconSvg from "../IdeComponentTree/SplitPanel/Comp1/InfoPanelIconSvg.svelte";

  let { options = $bindable() }: { options: InfoPanelComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-ide-card relative overflow-hidden">
  <div class="absolute inset-4 flex flex-col gap-3 opacity-10 pointer-events-none">
    {#each Array(8) as _, i}
      <div class="flex gap-2">
        <div class="h-2 rounded-full bg-ide-text-secondary" style="width: {60 + Math.sin(i) * 20}%"></div>
      </div>
    {/each}
  </div>
  
  <div class="relative z-10 flex flex-col items-center gap-3">
    <div class="p-4 rounded-2xl bg-ide-dcard/50 border border-ide-text-secondary/10">
      <InfoPanelIconSvg options={{ class: "w-12 h-12 stroke-[1.5] stroke-ide-text-primary/70" }}/>
    </div>
    <span class="text-sm text-ide-text-secondary/60 font-light tracking-wide">Problem info appears here</span>
  </div>
</main>