<script lang="ts">
	import type { InfoPanelComponentArgs } from "../../component-args";

  let { options = $bindable() }: { options: InfoPanelComponentArgs } = $props();
</script>

<div class="w-full h-full bg-gradient-to-br from-ide-card to-ide-bg p-4 rounded-lg">
  <div class="space-y-4 animate-pulse">
    <div class="h-8 bg-ide-dcard rounded w-3/4"></div>
  <div class="flex gap-3">
    <div class="h-6 bg-ide-dcard rounded w-20"></div>
    <div class="h-6 bg-ide-dcard rounded w-24"></div>
    <div class="h-6 bg-ide-dcard rounded w-16"></div>
    </div>
  <div class="space-y-2 mt-6">
    <div class="h-4 bg-ide-dcard rounded w-full"></div>
    <div class="h-4 bg-ide-dcard rounded w-11/12"></div>
    <div class="h-4 bg-ide-dcard rounded w-10/12"></div>
    </div>
  <div class="h-6 bg-ide-dcard rounded w-1/3 mt-6"></div>
  <div class="space-y-2">
    <div class="h-4 bg-ide-dcard rounded w-full"></div>
    <div class="h-4 bg-ide-dcard rounded w-9/12"></div>
    <div class="h-4 bg-ide-dcard rounded w-10/12"></div>
    <div class="h-4 bg-ide-dcard rounded w-8/12"></div>
  </div>
  <div class="mt-6 space-y-3">
    <div class="h-6 bg-ide-dcard rounded w-1/4"></div>
    <div class="bg-ide-card p-3 rounded space-y-2">
      <div class="h-3 bg-ide-dcard rounded w-1/2"></div>
      <div class="h-3 bg-ide-dcard rounded w-2/3"></div>
    </div>
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