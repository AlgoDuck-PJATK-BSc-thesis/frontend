<script lang="ts">
	import type { CodeEditorComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";

  let { options = $bindable() }: { options: CodeEditorComponentArgs } = $props();
</script>

<div class="w-full h-full bg-gradient-to-br from-ide-card to-ide-bg p-4 rounded-lg">
  <div class="space-y-3 animate-pulse">
    {#each Array(15) as _, i}
      <div class="flex gap-4 items-center">
        <div class="h-6 bg-ide-dcard rounded w-8 opacity-50"></div>
        <div class="h-6 bg-ide-dcard rounded" style="width: {Math.random() * 40 + 40}%"></div>
      </div>
    {/each}
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
