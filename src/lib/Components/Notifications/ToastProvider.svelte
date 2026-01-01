<script lang="ts">
	import ToastItem from './ToastItem.svelte';
	import { toast } from './ToastStore.svelte';

	$inspect(toast.toasts.at(0));
</script>

<div class="fixed bottom-[80%] right-4 z-999 flex flex-col gap-2 pointer-events-none">
	{#each toast.toasts as toastItem (toastItem.id)}
		<ToastItem toast={toastItem} onRemove={(id) => toast.remove(id)} />
	{/each}
</div>