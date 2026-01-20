<script lang="ts">
	import RoleFilterButtons from '$lib/Components/Admin/RoleFilterButtons.svelte';
	import TriangleIconSvg from '$lib/svg/EditorComponentIcons/TriangleIconSvg.svelte';

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
		(selectedFiltered ?? []).length > 0 &&
			(selectedFiltered ?? []).every((u) => Boolean(selectedExpanded?.[u.userId]))
	);

	const toggleExpandCollapseAll = () => {
		if (allExpanded) onCollapseAll();
		else onExpandAll();
	};
</script>

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div
		class="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
	>
		<div class="flex items-center gap-3">
			<div class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
				Selected users
			</div>
			<div class="text-xs text-admin-text-muted">({selectedUsers.length})</div>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<RoleFilterButtons bind:value={roleFilter} {disabled} />

			<span class="mx-1 text-admin-border-primary">|</span>

			<button
				type="button"
				onclick={onToggleOpen}
				{disabled}
				aria-label={selectedOpen
					? 'Collapse selected users section'
					: 'Expand selected users section'}
				class="relative flex h-9 w-9 items-center justify-center rounded-sm bg-admin-bg-input text-lg font-semibold text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				<div class={`absolute right-3 h-3 w-3 ${selectedOpen ? 'rotate-180' : ''}`}>
					<TriangleIconSvg
						options={{ class: 'h-full w-full stroke-[2] stroke-admin-text-muted' }}
					/>
				</div>
			</button>

			<button
				type="button"
				onclick={toggleExpandCollapseAll}
				disabled={disabled || selectedUsers.length === 0}
				class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				{allExpanded ? 'Collapse all' : 'Expand all'}
			</button>

			<button
				type="button"
				onclick={onClearAll}
				disabled={disabled || selectedUsers.length === 0}
				class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				Clear all
			</button>
		</div>
	</div>

	{#if selectedOpen}
		<div class="flex flex-col gap-3 p-4">
			{#if selectedFiltered.length === 0}
				<div class="text-sm text-admin-text-muted">No selected users for current role filter.</div>
			{:else}
				{#each selectedFiltered as u (u.userId)}
					<div
						class={`overflow-hidden rounded-sm border ${u.userId === activeUserId ? 'border-admin-accent-primary bg-admin-accent-selection' : 'border-admin-border-primary bg-admin-bg-primary'}`}
						role="button"
						tabindex="0"
						onclick={() => onSetActive(u.userId)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') onSetActive(u.userId);
						}}
					>
						<div class="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
							<div class="flex min-w-[240px] flex-1 flex-col gap-1">
								<div class="font-mono text-sm break-all text-admin-text-primary">{u.userId}</div>
								<div class="text-xs text-admin-text-muted">{(u.roles ?? []).join(', ')}</div>

								{#if selectedExpanded[u.userId]}
									<div class="flex flex-col gap-1 pt-2">
										<div class="text-xs text-admin-text-muted">
											Username: <span class="text-admin-text-primary">{u.username}</span>
										</div>
										<div class="text-xs text-admin-text-muted">
											Email: <span class="text-admin-text-primary">{u.email}</span>
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
									{disabled}
									class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
								>
									{selectedExpanded[u.userId] ? 'Hide details' : 'Show details'}
								</button>

								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										onRemove(u.userId);
									}}
									{disabled}
									class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
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
					<div class="font-mono text-sm break-all text-admin-text-muted">{activeUser.userId}</div>
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-admin-text-muted">
						<span>{(activeUser.roles ?? []).join(', ')}</span>
						<span>{activeUser.username}</span>
						<span>{activeUser.email}</span>
						<span class="mx-1 text-admin-border-primary">|</span>
						<span>(expand to see all selected users)</span>
					</div>
				</div>
			{:else}
				<div class="text-sm text-admin-text-muted">No active user.</div>
			{/if}
		</div>
	{/if}
</div>
