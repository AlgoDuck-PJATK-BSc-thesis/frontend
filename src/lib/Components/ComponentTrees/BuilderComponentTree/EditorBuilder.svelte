<script lang="ts">
	import type { CodeEditorComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import CodeEditorIconSvg from "../IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp1/CodeEditorIconSvg.svelte";

  let { options = $bindable() }: { options: CodeEditorComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-ide-bg relative overflow-hidden">
  <div class="absolute top-6 left-4 flex flex-col gap-1.5 opacity-15 text-xs font-mono">
    {#each [1,2,3,4,5] as num, i}
      <div class="flex items-center gap-3">
        <span class="text-ide-text-secondary/50 w-4 text-right">{num}</span>
        <div class="h-2 rounded bg-ide-text-secondary/30" style="width: {[80, 120, 60, 100, 40][i]}px"></div>
      </div>
    {/each}
  </div>

  <div class="absolute bottom-8 right-8 flex gap-1.5 opacity-20">
    <div class="w-8 h-2 rounded bg-purple-400"></div>
    <div class="w-12 h-2 rounded bg-blue-400"></div>
    <div class="w-6 h-2 rounded bg-ide-accent"></div>
  </div>

  <div class="relative z-10 flex flex-col items-center gap-3">
    <div class="p-4 rounded-2xl bg-ide-card border border-ide-dcard">
      <CodeEditorIconSvg options={{ class: "w-12 h-12 stroke-[1.5] stroke-ide-text-primary/70" }}/>
    </div>
    <span class="text-sm text-ide-text-secondary/60 font-light tracking-wide">Code editor appears here</span>
  </div>
</main>