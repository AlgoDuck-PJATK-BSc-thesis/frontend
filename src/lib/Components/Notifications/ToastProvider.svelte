<script lang="ts">
	import ToastItem from './ToastItem.svelte';
	import { toast } from './ToastStore.svelte';
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
	{#each toast.toasts as toastItem (toastItem.id)}
		<ToastItem toast={toastItem} onRemove={(id) => toast.remove(id)} />
	{/each}
</div>