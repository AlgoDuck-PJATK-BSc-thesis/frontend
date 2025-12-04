<script lang="ts">
	import type { TestCaseComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";

  let { options = $bindable() }: { options: TestCaseComponentArgs } = $props();
</script>

<div class="w-full h-full bg-gradient-to-br from-ide-card to-ide-bg p-4 rounded-lg">
  <div class="space-y-3 animate-pulse">
    {#each Array(4) as _, i}
      <div class="bg-ide-card p-3 rounded-lg space-y-2">
        <div class="flex justify-between items-center">
          <div class="h-4 bg-ide-dcard rounded w-24"></div>
          <div class="h-4 bg-ide-dcard rounded w-16"></div>
        </div>
        <div class="h-3 bg-ide-dcard rounded w-3/4"></div>
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