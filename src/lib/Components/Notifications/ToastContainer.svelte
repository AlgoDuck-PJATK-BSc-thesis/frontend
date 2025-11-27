<script lang="ts">
	import ToastItem from "./ToastItem.svelte";
	import type { Toast } from "./ToastStore.svelte";

	let { 
		toasts, 
		onRemove 
	}: { 
		toasts: Toast[], 
		onRemove: (id: string) => void 
	} = $props();
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
	{#each toasts as toast (toast.id)}
		<ToastItem {toast} {onRemove} />
	{/each}
</div> 