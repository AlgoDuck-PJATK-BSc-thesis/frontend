<script lang="ts">
	import type { TerminalComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import TerminalIconSvg from "$lib/svg/EditorComponentIcons/TerminalIconSvg.svelte";

  let { options = $bindable() }: { options: TerminalComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-ide-bg relative overflow-hidden font-mono">
  <div class="absolute top-6 left-6 flex flex-col gap-2 opacity-15 text-xs text-ide-text-secondary">
    <div class="flex items-center gap-2">
      <span class="text-ide-accent">❯</span>
      <div class="w-32 h-2 rounded bg-ide-text-secondary/30"></div>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-ide-accent">❯</span>
      <div class="w-20 h-2 rounded bg-ide-text-secondary/20"></div>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-ide-accent">❯</span>
      <div class="w-2 h-3 bg-ide-text-secondary/40 animate-pulse"></div>
    </div>
  </div>

  <div class="relative z-10 flex flex-col items-center gap-3">
    <div class="p-4 rounded-xl bg-ide-card border border-ide-dcard">
      <TerminalIconSvg options={{ class: "w-12 h-12 stroke-[1.5] stroke-green-400/80" }}/>
    </div>
    <span class="text-sm text-ide-text-secondary/60 font-light tracking-wide">Execution output appears here</span>
  </div>
</main>