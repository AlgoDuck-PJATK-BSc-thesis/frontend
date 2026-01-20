<script lang="ts">
	import type { TestCaseComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import TestCasesIconSvg from "../IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp2/TestCasesIconSvg.svelte";

  let { options = $bindable() }: { options: TestCaseComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-ide-card relative overflow-hidden">
  <div class="absolute top-6 right-6 flex flex-col gap-2 opacity-20">
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full bg-green-500"></div>
      <div class="w-16 h-2 rounded bg-ide-text-secondary/30"></div>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full bg-green-500"></div>
      <div class="w-12 h-2 rounded bg-ide-text-secondary/20"></div>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full bg-ide-text-secondary/30"></div>
      <div class="w-20 h-2 rounded bg-ide-text-secondary/20"></div>
    </div>
  </div>

  <div class="absolute inset-0 opacity-5" style="background-image: linear-gradient(rgba(255,19,240,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,19,240,0.1) 1px, transparent 1px); background-size: 24px 24px;"></div>

  <div class="relative z-10 flex flex-col items-center gap-3">
    <div class="p-4 rounded-2xl bg-ide-dcard/50 border border-ide-accent/10">
      <TestCasesIconSvg options={{ class: "w-12 h-12 stroke-[1.5] stroke-ide-accent/80" }}/>
    </div>
    <span class="text-sm text-ide-text-secondary/60 font-light tracking-wide">Test cases appear here</span>
  </div>
</main>