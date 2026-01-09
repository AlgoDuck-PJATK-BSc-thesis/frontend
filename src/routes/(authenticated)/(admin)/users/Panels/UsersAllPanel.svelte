<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import RoleFilterButtons from '$lib/Components/Admin/RoleFilterButtons.svelte';
	import UsersTable from '../UsersTable.svelte';

	type RoleFilter = 'all' | 'users' | 'admins';

	type PageData<T> = {
		items: T[];
		currPage: number;
		pageSize: number;
		totalItems: number;
		prevCursor: number | null;
		nextCursor: number | null;
	};

	type UserRow = {
		userId: string;
		email: string;
		username: string;
		roles: string[];
	};

	type Props = {
		roleFilter?: RoleFilter;
		pageSize?: number;

		loading: boolean;
		error: string | null;
		allLoadedOnce: boolean;

		allResult: PageData<UserRow>;
		filteredItems: UserRow[];

		selectedUserIds: string[];
		totalPages: number;

		disabled: boolean;

		onLoad: () => void;
		onPrev: () => void;
		onNext: () => void;
		onToggleSelect: (u: UserRow) => void;
	};

	const UsersTableAny = UsersTable as unknown as any;

	let {
		roleFilter = $bindable('all' as RoleFilter),
		pageSize = $bindable(20),

		loading,
		error,
		allLoadedOnce,

		allResult,
		filteredItems,

		selectedUserIds,
		totalPages,

		disabled,

		onLoad,
		onPrev,
		onNext,
		onToggleSelect
	} = $props() as Props;
</script>

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div
		class="flex items-center justify-between gap-2.5 border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
	>
		<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
			All users
		</h3>

		<div class="flex items-center gap-3">
			<label for="users_all_pagesize" class="text-xs text-admin-text-muted">Page size</label>
			<select
				id="users_all_pagesize"
				bind:value={pageSize}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-2 py-1 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover"
			>
				<option value={10}>10</option>
				<option value={20}>20</option>
				<option value={50}>50</option>
				<option value={100}>100</option>
			</select>

			<button
				type="button"
				onclick={onLoad}
				{disabled}
				class="ml-3 rounded-sm bg-admin-accent-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if loading}
					<LoadingDots />
				{:else}
					Load
				{/if}
			</button>

			<div class="ml-4 flex items-center gap-2">
				<button
					type="button"
					onclick={onPrev}
					disabled={loading || !allLoadedOnce || !allResult.prevCursor}
					class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
				>
					Prev
				</button>
				<div class="text-xs text-admin-text-muted">Page {allResult.currPage} / {totalPages}</div>
				<button
					type="button"
					onclick={onNext}
					disabled={loading || !allLoadedOnce || !allResult.nextCursor}
					class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
				>
					Next
				</button>
			</div>
		</div>
	</div>

	<div class="p-4">
		{#if error}<div class="mb-3 text-sm text-admin-danger-text">{error}</div>{/if}

		{#if loading}
			<div class="text-sm text-admin-text-muted"><LoadingDots /></div>
		{:else if !allLoadedOnce}
			<div class="text-sm text-admin-text-muted">Click Load to fetch users.</div>
		{:else if allResult.items.length === 0}
			<div class="text-sm text-admin-text-muted">No users.</div>
		{:else}
			<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
				<div class="text-xs text-admin-text-muted">
					Showing {filteredItems.length} of {allResult.items.length} on this page
				</div>
				<RoleFilterButtons bind:value={roleFilter} {disabled} />
			</div>

			{#if filteredItems.length === 0}
				<div class="text-sm text-admin-text-muted">
					No users for selected role filter on this page.
				</div>
			{:else}
				<UsersTableAny
					users={filteredItems}
					{selectedUserIds}
					{disabled}
					showSelectAll={true}
					{onToggleSelect}
				/>
			{/if}
		{/if}
	</div>
</div>
