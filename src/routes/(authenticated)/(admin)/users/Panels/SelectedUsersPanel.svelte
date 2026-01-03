<script lang="ts">
	import RoleFilterButtons from '$lib/Components/Admin/RoleFilterButtons.svelte';

	type RoleFilter = 'all' | 'users' | 'admins';

	type UserRow = {
		userId: string;
		email: string;
		username: string;
		roles: string[];
	};

	type Props = {
		roleFilter?: RoleFilter;
		disabled?: boolean;

		selectedUsers: UserRow[];
		selectedFiltered: UserRow[];

		selectedExpanded: Record<string, boolean>;
		selectedOpen: boolean;
		activeUserId: string | null;
		activeUser: UserRow | null;

		onToggleOpen: () => void;
		onExpandAll: () => void;
		onCollapseAll: () => void;
		onClearAll: () => void;

		onSetActive: (userId: string) => void;
		onToggleDetails: (userId: string) => void;
		onRemove: (userId: string) => void;
	};

	let {
		roleFilter = $bindable('all' as RoleFilter),
		disabled = false,

		selectedUsers,
		selectedFiltered,

		selectedExpanded,
		selectedOpen,
		activeUserId,
		activeUser,

		onToggleOpen,
		onExpandAll,
		onCollapseAll,
		onClearAll,

		onSetActive,
		onToggleDetails,
		onRemove
	} = $props() as Props;

	const allExpanded = $derived(
		(selectedFiltered ?? []).length > 0 && (selectedFiltered ?? []).every((u) => Boolean(selectedExpanded?.[u.userId]))
	);

	const toggleExpandCollapseAll = () => {
		if (allExpanded) onCollapseAll();
		else onExpandAll();
	};
</script>

<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
	<div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c] flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Selected users</div>
			<div class="text-xs text-[#a8a8a8]">({selectedUsers.length})</div>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<RoleFilterButtons bind:value={roleFilter} disabled={disabled} />

			<span class="mx-1 text-[#3c3c3c]">|</span>

			<button
				type="button"
				onclick={onToggleOpen}
				disabled={disabled}
				aria-label={selectedOpen ? 'Collapse selected users section' : 'Expand selected users section'}
				class="w-9 h-9 flex items-center justify-center bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-lg font-semibold hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{selectedOpen ? '▴' : '▾'}
			</button>

			<button
				type="button"
				onclick={toggleExpandCollapseAll}
				disabled={disabled || selectedUsers.length === 0}
				class="px-3 py-2 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{allExpanded ? 'Collapse all' : 'Expand all'}
			</button>

			<button
				type="button"
				onclick={onClearAll}
				disabled={disabled || selectedUsers.length === 0}
				class="px-3 py-2 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Clear all
			</button>
		</div>
	</div>

	{#if selectedOpen}
		<div class="p-4 flex flex-col gap-3">
			{#if selectedFiltered.length === 0}
				<div class="text-sm text-[#a8a8a8]">No selected users for current role filter.</div>
			{:else}
				{#each selectedFiltered as u (u.userId)}
					<div
						class={`border rounded-sm overflow-hidden ${u.userId === activeUserId ? 'border-[#0e639c] bg-[#1f2a33]' : 'border-[#3c3c3c] bg-[#1f1f1f]'}`}
						role="button"
						tabindex="0"
						onclick={() => onSetActive(u.userId)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') onSetActive(u.userId);
						}}
					>
						<div class="px-4 py-3 flex flex-wrap items-start justify-between gap-3">
							<div class="flex flex-col gap-1 flex-1 min-w-[240px]">
								<div class="text-sm text-[#e7e7e7] font-mono break-all">{u.userId}</div>
								<div class="text-xs text-[#a8a8a8]">{(u.roles ?? []).join(', ')}</div>

								{#if selectedExpanded[u.userId]}
									<div class="pt-2 flex flex-col gap-1">
										<div class="text-xs text-[#a8a8a8]">
											Username: <span class="text-[#e7e7e7]">{u.username}</span>
										</div>
										<div class="text-xs text-[#a8a8a8]">
											Email: <span class="text-[#e7e7e7]">{u.email}</span>
										</div>
									</div>
								{/if}
							</div>

							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										onToggleDetails(u.userId);
									}}
									disabled={disabled}
									class="px-3 py-2 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{selectedExpanded[u.userId] ? 'Hide details' : 'Show details'}
								</button>

								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										onRemove(u.userId);
									}}
									disabled={disabled}
									class="px-3 py-2 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Remove
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{:else}
		<div class="p-3">
			{#if activeUser}
				<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
					<div class="text-sm text-[#a8a8a8] font-mono break-all">{activeUser.userId}</div>
					<div class="text-xs text-[#a8a8a8] flex flex-wrap items-center gap-x-3 gap-y-1">			
						<span>{(activeUser.roles ?? []).join(', ')}</span>
						<span>{activeUser.username}</span>
						<span>{activeUser.email}</span>
						<span class="mx-1 text-[#3c3c3c]">|</span>
						<span>(expand to see all selected users)</span>
					</div>
				</div>
			{:else}
				<div class="text-sm text-[#a8a8a8]">No active user.</div>
			{/if}
		</div>
	{/if}
</div>
