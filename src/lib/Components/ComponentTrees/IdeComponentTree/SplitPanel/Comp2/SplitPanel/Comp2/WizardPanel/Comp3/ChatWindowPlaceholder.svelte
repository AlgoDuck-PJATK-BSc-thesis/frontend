<script lang='ts'>
	import type { WizardComponentArg } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";

	let { options }: { options: WizardComponentArg } = $props();
</script>

<div class="w-full h-full flex flex-row bg-gradient-to-br from-ide-card to-ide-bg rounded-lg overflow-hidden">
	<div class="h-full w-48 p-3 space-y-2 border-r border-ide-accent/10 animate-pulse">
		{#each Array(5) as _, i}
			<div class="p-2 rounded-lg bg-ide-dcard/50 space-y-2">
				<div class="h-3 bg-ide-dcard rounded w-3/4"></div>
				<div class="h-2 bg-ide-dcard/70 rounded w-full"></div>
			</div>
		{/each}
	</div>

	<div class="flex-1 h-full p-4 flex flex-col animate-pulse">
		<div class="flex-1 space-y-4">
			<div class="flex justify-end">
				<div class="h-10 bg-ide-accent/20 rounded-2xl rounded-br-sm w-1/2"></div>
			</div>
			<div class="flex justify-start">
				<div class="h-20 bg-ide-dcard rounded-2xl rounded-tl-sm w-2/3"></div>
			</div>
			<div class="flex justify-end">
				<div class="h-8 bg-ide-accent/20 rounded-2xl rounded-br-sm w-1/3"></div>
			</div>
			<div class="flex justify-start">
				<div class="h-14 bg-ide-dcard rounded-2xl rounded-tl-sm w-1/2"></div>
			</div>
		</div>
		
		<div class="h-12 bg-ide-dcard/50 rounded-xl mt-4"></div>
	</div>
</div>

<style>
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
	
	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>