<script lang="ts">
	type CohortMemberRow = {
		userId: string;
		userName: string;
		email: string;
		joinedAt?: string | null;
	};

	export let members: CohortMemberRow[] = [];
	export let onRemove: ((userId: string) => void) | null = null;
	export let removingUserId: string | null = null;
	export let disabled: boolean = false;

	const formatJoinedAt = (value: string | null | undefined) => {
		if (!value) return '—';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '—';
		return d.toLocaleString();
	};
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="text-left text-[#e7e7e7]">
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User ID</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User name</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Joined at</th>
				<th class="py-2 pr-0 border-b border-[#3c3c3c]">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each members as m (m.userId)}
				<tr class="text-[#cccccc]">
					<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs">{m.userId}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{m.userName}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{m.email}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{formatJoinedAt(m.joinedAt)}</td>
					<td class="py-2 pr-0 border-b border-[#2a2a2a]">
						{#if onRemove}
							<button
								type="button"
								onclick={() => onRemove?.(m.userId)}
								disabled={disabled || removingUserId === m.userId}
								class="px-3 py-1.5 bg-[#a1260d] text-white rounded-sm text-xs font-medium hover:bg-[#c83b1a] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Remove
							</button>
						{:else}
							<span class="text-xs text-[#a8a8a8]">—</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
