<script lang="ts">
	type UserRow = {
		userId: string;
		email: string;
		username: string;
		roles: string[];
	};

	type Props = {
		users?: UserRow[];
		selectedUserIds?: string[];
		disabled?: boolean;
		showSelectAll?: boolean;
		onToggleSelect?: (u: UserRow) => void;
	};

	let {
		users = [],
		selectedUserIds = [],
		disabled = false,
		showSelectAll = false,
		onToggleSelect = () => {}
	} = $props() as Props;

	const isSelected = (id: string) => (selectedUserIds ?? []).includes(id);

	const allVisibleSelected = $derived(
		(users ?? []).length > 0 && (users ?? []).every((u) => isSelected(u.userId))
	);

	const toggleAllVisible = () => {
		const rows = users ?? [];
		if (rows.length === 0) return;

		if (allVisibleSelected) {
			for (const u of rows) {
				if (isSelected(u.userId)) onToggleSelect(u);
			}
			return;
		}

		for (const u of rows) {
			if (!isSelected(u.userId)) onToggleSelect(u);
		}
	};
</script>

<div class="overflow-x-auto">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="text-left text-admin-text-primary">
				<th class="border-b border-admin-border-primary py-2 pr-4">User ID</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Username</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Email</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Roles</th>
				<th class="border-b border-admin-border-primary py-2 pr-0 text-right">
					{#if showSelectAll}
						<button
							type="button"
							onclick={toggleAllVisible}
							disabled={disabled || (users?.length ?? 0) === 0}
							class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-semibold tracking-wider text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
						>
							{allVisibleSelected ? 'UNSELECT ALL' : 'SELECT ALL'}
						</button>
					{/if}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each users as u (u.userId)}
				{@const sel = isSelected(u.userId)}
				<tr
					class={sel
						? 'bg-admin-accent-selection text-admin-text-primary'
						: 'text-admin-text-secondary'}
				>
					<td class="border-b border-admin-border-primary py-2 pr-4 font-mono text-xs"
						>{u.userId}</td
					>
					<td class="border-b border-admin-border-primary py-2 pr-4">{u.username}</td>
					<td class="border-b border-admin-border-primary py-2 pr-4">{u.email}</td>
					<td class="border-b border-admin-border-primary py-2 pr-4"
						>{(u.roles ?? []).join(', ')}</td
					>
					<td class="border-b border-admin-border-primary py-2 pr-0 text-right">
						<button
							type="button"
							onclick={() => onToggleSelect(u)}
							{disabled}
							class={sel
								? 'rounded-sm bg-admin-accent-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50'
								: 'rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50'}
						>
							{sel ? 'Selected' : 'Select'}
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
