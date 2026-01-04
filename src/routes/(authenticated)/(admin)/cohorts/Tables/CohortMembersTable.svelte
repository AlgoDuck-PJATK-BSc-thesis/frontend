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
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="text-left text-admin-text-primary">
				<th class="border-b border-admin-border-primary py-2 pr-4">User ID</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">User name</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Email</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Joined at</th>
				<th class="border-b border-admin-border-primary py-2 pr-0">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each members as m (m.userId)}
				<tr class="text-admin-text-secondary">
					<td class="border-b border-admin-border-primary py-2 pr-4 font-mono text-xs"
						>{m.userId}</td
					>
					<td class="border-b border-admin-border-primary py-2 pr-4">{m.userName}</td>
					<td class="border-b border-admin-border-primary py-2 pr-4">{m.email}</td>
					<td class="border-b border-admin-border-primary py-2 pr-4"
						>{formatJoinedAt(m.joinedAt)}</td
					>
					<td class="border-b border-admin-border-primary py-2 pr-0">
						{#if onRemove}
							<button
								type="button"
								onclick={() => onRemove?.(m.userId)}
								disabled={disabled || removingUserId === m.userId}
								class="rounded-sm bg-admin-danger-bg px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-danger-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Remove
							</button>
						{:else}
							<span class="text-xs text-admin-text-muted">—</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
