<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	type Props = {
		disabled?: boolean;
		deleting?: boolean;
		error?: string | null;
		initialUserId?: string;
		onDelete: (userId: string) => void;
	};

	let { disabled = false, deleting = false, error = null, initialUserId = '', onDelete } = $props() as Props;

	let userId = $state(initialUserId);

	$effect(() => {
		userId = initialUserId;
	});

	const submit = () => {
		const id = userId.trim();
		if (!id) return;
		onDelete(id);
	};
</script>

<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
	<div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
		<h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Delete user</h3>
	</div>

	<div class="p-4 flex flex-col gap-4">
		{#if error}
			<div class="text-sm text-[#ffb4b4]">{error}</div>
		{/if}

		<div class="flex flex-col gap-2">
			<label for="admin_delete_userid" class="text-xs text-[#a8a8a8]">User ID</label>
			<input
				id="admin_delete_userid"
				type="text"
				bind:value={userId}
				disabled={disabled || deleting}
				class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] font-mono outline-none focus:border-[#007fd4] disabled:opacity-50"
			/>
		</div>

		<div class="flex items-center justify-end">
			<button
				type="button"
				onclick={submit}
				disabled={disabled || deleting || !userId.trim()}
				class="px-3 py-2 bg-[#a1260d] text-white rounded-sm text-xs font-medium hover:bg-[#c83b1a] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if deleting}
					<LoadingDots />
				{:else}
					Delete
				{/if}
			</button>
		</div>
	</div>
</div>
