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

<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
	<div class="flex items-center justify-between gap-2.5 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
		<h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">All users</h3>

		<div class="flex items-center gap-3">
			<label for="users_all_pagesize" class="text-xs text-[#a8a8a8]">Page size</label>
			<select
				id="users_all_pagesize"
				bind:value={pageSize}
				class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-2 py-1 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4]"
			>
				<option value={10}>10</option>
				<option value={20}>20</option>
				<option value={50}>50</option>
				<option value={100}>100</option>
			</select>

			<button
				type="button"
				onclick={onLoad}
				disabled={disabled}
				class="ml-3 px-3 py-1.5 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
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
					class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Prev
				</button>
				<div class="text-xs text-[#a8a8a8]">Page {allResult.currPage} / {totalPages}</div>
				<button
					type="button"
					onclick={onNext}
					disabled={loading || !allLoadedOnce || !allResult.nextCursor}
					class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Next
				</button>
			</div>
		</div>
	</div>

	<div class="p-4">
		{#if error}<div class="text-sm text-[#ffb4b4] mb-3">{error}</div>{/if}

		{#if loading}
			<div class="text-sm text-[#a8a8a8]"><LoadingDots /></div>
		{:else if !allLoadedOnce}
			<div class="text-sm text-[#a8a8a8]">Click Load to fetch users.</div>
		{:else if allResult.items.length === 0}
			<div class="text-sm text-[#a8a8a8]">No users.</div>
		{:else}
			<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
				<div class="text-xs text-[#a8a8a8]">Showing {filteredItems.length} of {allResult.items.length} on this page</div>
				<RoleFilterButtons bind:value={roleFilter} disabled={disabled} />
			</div>

			{#if filteredItems.length === 0}
				<div class="text-sm text-[#a8a8a8]">No users for selected role filter on this page.</div>
			{:else}
				<UsersTableAny
					users={filteredItems}
					selectedUserIds={selectedUserIds}
					disabled={disabled}
					showSelectAll={true}
					onToggleSelect={onToggleSelect}
				/>
			{/if}
		{/if}
	</div>
</div>
