<script lang="ts">
	import type { TerminalComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";

  let { options = $bindable() }: { options: TerminalComponentArgs } = $props();
</script>

<div class="w-full h-full bg-gradient-to-br from-ide-card to-ide-bg p-4 rounded-lg">
  <div class="space-y-2 animate-pulse">
    <div class="flex items-center gap-2">
      <div class="h-3 bg-ide-accent rounded w-4"></div>
      <div class="h-3 bg-ide-dcard rounded w-32"></div>
    </div>
    <div class="flex items-center gap-2">
      <div class="h-3 bg-ide-accent rounded w-4"></div>
      <div class="h-3 bg-ide-dcard rounded w-48"></div>
    </div>
    <div class="flex items-center gap-2 mt-4">
      <div class="h-3 bg-ide-dcard rounded w-24"></div>
    </div>
    <div class="flex items-center gap-2">
      <div class="h-3 bg-ide-dcard rounded w-40"></div>
    </div>
  </div>
</div>

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>