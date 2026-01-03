<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import RoleFilterButtons from '$lib/Components/Admin/RoleFilterButtons.svelte';

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

	type SearchUsersResult = {
		idMatch: UserRow | null;
		username: PageData<UserRow>;
		email: PageData<UserRow>;
	};

	type SearchMode = 'guid' | 'username' | 'email';

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

	let mode = $state<SearchMode>('username');

	const isSelected = (userId: string) => (selectedUserIds ?? []).includes(userId);

	const escapeHtml = (s: string) =>
		s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

	const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	const highlight = (text: string, q: string) => {
		const raw = text ?? '';
		const query = (q ?? '').trim();
		if (!query) return escapeHtml(raw);

		const safe = escapeHtml(raw);
		const pattern = escapeRegex(escapeHtml(query));
		if (!pattern) return safe;

		const re = new RegExp(pattern, 'ig');
		return safe.replace(re, (m) => `<span class="bg-[#264f78] text-[#e7e7e7] px-1 rounded-sm">${m}</span>`);
	};

	const modeButtonClass = (m: SearchMode) =>
		`px-3 py-1.5 rounded-sm text-xs font-medium border disabled:opacity-50 disabled:cursor-not-allowed ${
			mode === m ? 'bg-[#0e639c] text-white border-[#0e639c]' : 'bg-[#1f1f1f] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#2a2a2a]'
		}`;

	const selectLabel = (u: UserRow) => (isSelected(u.userId) ? 'Selected' : 'Select');

	const selectButtonClass = (u: UserRow) =>
		`px-3 py-1.5 rounded-sm text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
			isSelected(u.userId) ? 'bg-[#0e639c] text-white' : 'bg-[#3c3c3c] text-[#e7e7e7] hover:bg-[#4a4a4a]'
		}`;

	const tableRowClass = (u: UserRow) => (isSelected(u.userId) ? 'bg-[#1f2a33] text-[#e7e7e7]' : 'text-[#cccccc]');
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
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2">
						<button type="button" class={modeButtonClass('guid')} onclick={() => (mode = 'guid')} disabled={loading}>
							GUID
						</button>
						<button type="button" class={modeButtonClass('username')} onclick={() => (mode = 'username')} disabled={loading}>
							Username
						</button>
						<button type="button" class={modeButtonClass('email')} onclick={() => (mode = 'email')} disabled={loading}>
							Email
						</button>
					</div>

					<div class="text-[#3c3c3c] select-none">|</div>

					<RoleFilterButtons bind:value={roleFilter} disabled={loading || !hasAnySearchResults} />
				</div>
			{/if}
		</div>

		{#if error}<div class="text-sm text-[#ffb4b4]">{error}</div>{/if}

		{#if loading}
			<div class="text-sm text-[#a8a8a8]"><LoadingDots /></div>
		{:else if searchedOnce}
			<div class="border border-[#3c3c3c] rounded overflow-hidden">
				<div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center justify-between gap-3">
					<div class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Query matches</div>

					{#if mode === 'username'}
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
					{:else if mode === 'email'}
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
					{:else}
						<div class="text-xs text-[#a8a8a8]">GUID match</div>
					{/if}
				</div>

				<div class="p-4">
					{#if mode === 'guid'}
						{#if searchResult.idMatch && !idMatchHiddenByFilter}
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div class="flex flex-col gap-1">
									<div class="text-xs text-[#a8a8a8] font-mono break-all">
										{@html highlight(searchResult.idMatch.userId, searchQuery)}
									</div>
									<div class="text-sm text-[#e7e7e7]">{searchResult.idMatch.username}</div>
									<div class="text-xs text-[#a8a8a8]">{searchResult.idMatch.email}</div>
									<div class="text-xs text-[#a8a8a8]">{(searchResult.idMatch.roles ?? []).join(', ')}</div>
								</div>

								<button
									type="button"
									onclick={() => onToggleSelectMaybe(searchResult.idMatch)}
									disabled={disabled}
									class={selectButtonClass(searchResult.idMatch)}
								>
									{selectLabel(searchResult.idMatch)}
								</button>
							</div>
						{:else if searchResult.idMatch && idMatchHiddenByFilter}
							<div class="text-sm text-[#a8a8a8]">GUID match exists, but it’s hidden by the current role filter.</div>
						{:else}
							<div class="text-sm text-[#a8a8a8]">No GUID match.</div>
						{/if}
					{:else}
						{#if mode === 'username' && searchResult.username.totalItems === 0}
							<div class="text-sm text-[#a8a8a8]">No matches.</div>
						{:else if mode === 'email' && searchResult.email.totalItems === 0}
							<div class="text-sm text-[#a8a8a8]">No matches.</div>
						{:else if mode === 'username' && filteredUsernameItems.length === 0}
							<div class="text-sm text-[#a8a8a8]">No matches for selected role filter on this page.</div>
						{:else if mode === 'email' && filteredEmailItems.length === 0}
							<div class="text-sm text-[#a8a8a8]">No matches for selected role filter on this page.</div>
						{:else}
							<div class="overflow-x-auto">
								<table class="w-full text-sm border-collapse">
									<thead>
										<tr class="text-left text-[#e7e7e7]">
											<th class="py-2 pr-4 border-b border-[#3c3c3c]">User ID</th>
											<th class="py-2 pr-4 border-b border-[#3c3c3c]">Username</th>
											<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
											<th class="py-2 pr-4 border-b border-[#3c3c3c]">Roles</th>
											<th class="py-2 pr-0 border-b border-[#3c3c3c]"></th>
										</tr>
									</thead>
									<tbody>
										{#each (mode === 'username' ? filteredUsernameItems : filteredEmailItems) as u (u.userId)}
											<tr class={tableRowClass(u)}>
												<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs break-all">{u.userId}</td>
												<td class="py-2 pr-4 border-b border-[#2a2a2a]">
													{#if mode === 'username'}
														<span class="text-[#e7e7e7]">{@html highlight(u.username, searchQuery)}</span>
													{:else}
														{u.username}
													{/if}
												</td>
												<td class="py-2 pr-4 border-b border-[#2a2a2a]">
													{#if mode === 'email'}
														<span class="text-[#e7e7e7]">{@html highlight(u.email, searchQuery)}</span>
													{:else}
														{u.email}
													{/if}
												</td>
												<td class="py-2 pr-4 border-b border-[#2a2a2a]">{(u.roles ?? []).join(', ')}</td>
												<td class="py-2 pr-0 border-b border-[#2a2a2a] text-right">
													<button
														type="button"
														onclick={() => onToggleSelect(u)}
														disabled={disabled}
														class={selectButtonClass(u)}
													>
														{selectLabel(u)}
													</button>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					{/if}

					{#if !hasAnySearchResults}
						<div class="mt-3 text-sm text-[#a8a8a8]">No results.</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="text-sm text-[#a8a8a8]">Type a query and click Search.</div>
		{/if}
	</div>
</div>
