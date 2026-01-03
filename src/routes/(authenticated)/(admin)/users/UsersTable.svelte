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

	const allVisibleSelected = $derived((users ?? []).length > 0 && (users ?? []).every((u) => isSelected(u.userId)));

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
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="text-left text-[#e7e7e7]">
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User ID</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Username</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Roles</th>
				<th class="py-2 pr-0 border-b border-[#3c3c3c] text-right">
					{#if showSelectAll}
						<button
							type="button"
							onclick={toggleAllVisible}
							disabled={disabled || (users?.length ?? 0) === 0}
							class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-semibold tracking-wider hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
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
				<tr class={sel ? 'bg-[#1f2a33] text-[#e7e7e7]' : 'text-[#cccccc]'}>
					<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs">{u.userId}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.username}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.email}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{(u.roles ?? []).join(', ')}</td>
					<td class="py-2 pr-0 border-b border-[#2a2a2a] text-right">
						<button
							type="button"
							onclick={() => onToggleSelect(u)}
							disabled={disabled}
							class={sel
								? 'px-3 py-1.5 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed'
								: 'px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed'}
						>
							{sel ? 'Selected' : 'Select'}
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
