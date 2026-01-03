<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import RoleFilterButtons from '$lib/Components/Admin/RoleFilterButtons.svelte';
	import type { RoleFilter, SearchUsersResult, UserRow } from '$lib/Components/Admin/Users/types';

	type Props = {
		roleFilter?: RoleFilter;

		loading: boolean;
		error: string | null;

		searchedOnce: boolean;
		hasAnySearchResults: boolean;

		searchQuery?: string;
		searchPageSize?: number;

		searchResult: SearchUsersResult;

		filteredUsernameItems: UserRow[];
		filteredEmailItems: UserRow[];

		usernameTotalPages: number;
		emailTotalPages: number;

		idMatchHiddenByFilter: boolean;

		selectedUserIds: string[];

		disabled?: boolean;

		onSearchFromStart: () => void;
		onPageSizeChanged: () => void;

		onUsernamePrev: () => void;
		onUsernameNext: () => void;
		onEmailPrev: () => void;
		onEmailNext: () => void;

		onToggleSelect: (u: UserRow) => void;
		onToggleSelectMaybe: (u: UserRow | null) => void;
	};

	let {
		roleFilter = $bindable('all' as RoleFilter),

		loading,
		error,

		searchedOnce,
		hasAnySearchResults,

		searchQuery = $bindable(''),
		searchPageSize = $bindable(20),

		searchResult,
		filteredUsernameItems,
		filteredEmailItems,

		usernameTotalPages,
		emailTotalPages,

		idMatchHiddenByFilter,

		selectedUserIds,

		disabled = false,

		onSearchFromStart,
		onPageSizeChanged,

		onUsernamePrev,
		onUsernameNext,
		onEmailPrev,
		onEmailNext,

		onToggleSelect,
		onToggleSelectMaybe
	} = $props() as Props;

	const isSelected = (userId: string) => (selectedUserIds ?? []).includes(userId);
</script>

<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
	<div class="flex items-center justify-between gap-2.5 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
		<h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Search users</h3>

		<div class="flex items-center gap-3">
			<label for="users_search_pagesize" class="text-xs text-[#a8a8a8]">Page size</label>
			<select
				id="users_search_pagesize"
				bind:value={searchPageSize}
				onchange={onPageSizeChanged}
				class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-2 py-1 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4]"
			>
				<option value={10}>10</option>
				<option value={20}>20</option>
				<option value={50}>50</option>
				<option value={100}>100</option>
			</select>
		</div>
	</div>

	<div class="p-4 flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<label for="users_search_query" class="text-xs text-[#a8a8a8]">Query</label>
			<input
				id="users_search_query"
				bind:value={searchQuery}
				class="w-full bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4]"
				placeholder="Type part of username/email (GUID also supported)"
				onkeydown={(e) => {
					if (e.key === 'Enter') onSearchFromStart();
				}}
			/>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3">
			<button
				type="button"
				onclick={onSearchFromStart}
				disabled={loading || !searchQuery.trim()}
				class="px-3 py-1.5 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Search
			</button>

			{#if searchedOnce}
				<RoleFilterButtons bind:value={roleFilter} disabled={loading || !hasAnySearchResults} />
			{/if}
		</div>

		{#if error}<div class="text-sm text-[#ffb4b4]">{error}</div>{/if}

		{#if loading}
			<div class="text-sm text-[#a8a8a8]"><LoadingDots /></div>
		{:else if searchedOnce}
			{#if searchResult.idMatch}
				<div class="border border-[#3c3c3c] rounded bg-[#1f1f1f] px-4 py-3 flex flex-wrap items-start justify-between gap-3">
					<div class="flex flex-col gap-1">
						<div class="text-xs text-[#a8a8a8] uppercase tracking-wider">GUID match</div>
						<div class="text-xs text-[#a8a8a8] font-mono break-all">{searchResult.idMatch.userId}</div>
						<div class="text-sm text-[#e7e7e7]">{searchResult.idMatch.username}</div>
						<div class="text-xs text-[#a8a8a8]">{searchResult.idMatch.email}</div>
						<div class="text-xs text-[#a8a8a8]">{(searchResult.idMatch.roles ?? []).join(', ')}</div>
						{#if idMatchHiddenByFilter}
							<div class="text-xs text-[#a8a8a8]">Hidden by current role filter</div>
						{/if}
					</div>

					<button
						type="button"
						onclick={() => onToggleSelectMaybe(searchResult.idMatch)}
						disabled={disabled}
						class={`px-3 py-1.5 rounded-sm text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isSelected(searchResult.idMatch.userId) ? 'bg-[#0e639c] text-white' : 'bg-[#3c3c3c] text-[#e7e7e7] hover:bg-[#4a4a4a]'}`}
					>
						{isSelected(searchResult.idMatch.userId) ? 'Selected' : 'Select'}
					</button>
				</div>
			{/if}

			<div class="border border-[#3c3c3c] rounded overflow-hidden">
				<div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center justify-between gap-3">
					<div class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Username matches</div>
					<div class="flex flex-wrap items-center gap-3">
						<div class="text-xs text-[#a8a8a8]">Total: {searchResult.username.totalItems}</div>
						<div class="text-xs text-[#a8a8a8]">Showing: {filteredUsernameItems.length}</div>
						<div class="text-xs text-[#a8a8a8]">Page {searchResult.username.currPage} / {usernameTotalPages}</div>
						<button
							type="button"
							onclick={onUsernamePrev}
							disabled={!searchResult.username.prevCursor}
							class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Prev
						</button>
						<button
							type="button"
							onclick={onUsernameNext}
							disabled={!searchResult.username.nextCursor}
							class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>

				<div class="p-4">
					{#if searchResult.username.totalItems === 0}
						<div class="text-sm text-[#a8a8a8]">No username matches.</div>
					{:else if filteredUsernameItems.length === 0}
						<div class="text-sm text-[#a8a8a8]">No username matches for selected role filter on this page.</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-sm border-collapse">
								<thead>
									<tr class="text-left text-[#e7e7e7]">
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">User ID</th>
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">User</th>
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">Roles</th>
										<th class="py-2 pr-0 border-b border-[#3c3c3c]"></th>
									</tr>
								</thead>
								<tbody>
									{#each filteredUsernameItems as u (u.userId)}
										<tr class={isSelected(u.userId) ? 'bg-[#1f2a33] text-[#e7e7e7]' : 'text-[#cccccc]'}>
											<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs break-all">{u.userId}</td>
											<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.username}</td>
											<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.email}</td>
											<td class="py-2 pr-4 border-b border-[#2a2a2a]">{(u.roles ?? []).join(', ')}</td>
											<td class="py-2 pr-0 border-b border-[#2a2a2a] text-right">
												<button
													type="button"
													onclick={() => onToggleSelect(u)}
													disabled={disabled}
													class={`px-3 py-1.5 rounded-sm text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isSelected(u.userId) ? 'bg-[#0e639c] text-white' : 'bg-[#3c3c3c] text-[#e7e7e7] hover:bg-[#4a4a4a]'}`}
												>
													{isSelected(u.userId) ? 'Selected' : 'Select'}
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>

			<div class="border border-[#3c3c3c] rounded overflow-hidden">
				<div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center justify-between gap-3">
					<div class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Email matches</div>
					<div class="flex flex-wrap items-center gap-3">
						<div class="text-xs text-[#a8a8a8]">Total: {searchResult.email.totalItems}</div>
						<div class="text-xs text-[#a8a8a8]">Showing: {filteredEmailItems.length}</div>
						<div class="text-xs text-[#a8a8a8]">Page {searchResult.email.currPage} / {emailTotalPages}</div>
						<button
							type="button"
							onclick={onEmailPrev}
							disabled={!searchResult.email.prevCursor}
							class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Prev
						</button>
						<button
							type="button"
							onclick={onEmailNext}
							disabled={!searchResult.email.nextCursor}
							class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>

				<div class="p-4">
					{#if searchResult.email.totalItems === 0}
						<div class="text-sm text-[#a8a8a8]">No email matches.</div>
					{:else if filteredEmailItems.length === 0}
						<div class="text-sm text-[#a8a8a8]">No email matches for selected role filter on this page.</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-sm border-collapse">
								<thead>
									<tr class="text-left text-[#e7e7e7]">
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">User ID</th>
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">User</th>
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">Roles</th>
										<th class="py-2 pr-0 border-b border-[#3c3c3c]"></th>
									</tr>
								</thead>
								<tbody>
									{#each filteredEmailItems as u (u.userId)}
										<tr class={isSelected(u.userId) ? 'bg-[#1f2a33] text-[#e7e7e7]' : 'text-[#cccccc]'}>
											<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs break-all">{u.userId}</td>
											<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.username}</td>
											<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.email}</td>
											<td class="py-2 pr-4 border-b border-[#2a2a2a]">{(u.roles ?? []).join(', ')}</td>
											<td class="py-2 pr-0 border-b border-[#2a2a2a] text-right">
												<button
													type="button"
													onclick={() => onToggleSelect(u)}
													disabled={disabled}
													class={`px-3 py-1.5 rounded-sm text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isSelected(u.userId) ? 'bg-[#0e639c] text-white' : 'bg-[#3c3c3c] text-[#e7e7e7] hover:bg-[#4a4a4a]'}`}
												>
													{isSelected(u.userId) ? 'Selected' : 'Select'}
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>

			{#if !hasAnySearchResults}
				<div class="text-sm text-[#a8a8a8]">No results.</div>
			{/if}
		{:else}
			<div class="text-sm text-[#a8a8a8]">Type a query and click Search.</div>
		{/if}
	</div>
</div>
