<script lang="ts">
	import type { TestCaseComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import AssistantIconSvg from "../IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp3/AssistantIconSvg.svelte";

  let { options = $bindable() }: { options: TestCaseComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-ide-card relative overflow-hidden">
  <div class="absolute top-8 left-8 flex flex-col gap-2 opacity-20">
    <div class="w-24 h-3 rounded-full bg-ide-text-secondary/30"></div>
    <div class="w-16 h-3 rounded-full bg-ide-text-secondary/20"></div>
  </div>
  <div class="absolute bottom-12 right-8 flex flex-col gap-2 opacity-20 items-end">
    <div class="w-20 h-3 rounded-full bg-ide-accent/40"></div>
    <div class="w-28 h-3 rounded-full bg-ide-accent/30"></div>
  </div>

  <div class="relative z-10 flex flex-col items-center gap-3">
    <div class="p-4 rounded-2xl bg-ide-dcard/50 border border-ide-accent/10">
      <AssistantIconSvg options={{ class: "w-12 h-12 stroke-[1.5] stroke-ide-accent" }}/>
    </div>
    <span class="text-sm text-ide-text-secondary/60 font-light tracking-wide">Assistant chats appear here</span>
  </div>
</main>