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
		s
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');

	const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	const highlight = (text: string, q: string) => {
		const raw = text ?? '';
		const query = (q ?? '').trim();
		if (!query) return escapeHtml(raw);

		const safe = escapeHtml(raw);
		const pattern = escapeRegex(escapeHtml(query));
		if (!pattern) return safe;

		const re = new RegExp(pattern, 'ig');
		return safe.replace(
			re,
			(m) =>
				`<span class="bg-admin-accent-selection text-admin-text-primary px-1 rounded-sm">${m}</span>`
		);
	};

	const modeButtonClass = (m: SearchMode) =>
		`px-3 py-1.5 rounded-sm text-xs font-medium border disabled:opacity-50 disabled:cursor-not-allowed ${
			mode === m
				? 'bg-admin-accent-primary text-white border-admin-accent-primary'
				: 'bg-admin-bg-primary text-admin-text-primary border-admin-border-primary hover:bg-admin-bg-hover'
		}`;

	const selectLabel = (u: UserRow) => (isSelected(u.userId) ? 'Selected' : 'Select');

	const selectButtonClass = (u: UserRow) =>
		`px-3 py-1.5 rounded-sm text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
			isSelected(u.userId)
				? 'bg-admin-accent-selection text-white hover:bg-admin-accent-primary'
				: 'bg-admin-bg-input text-admin-text-primary hover:bg-admin-bg-hover'
		}`;

	const tableRowClass = (u: UserRow) =>
		isSelected(u.userId)
			? 'bg-admin-accent-primary text-admin-text-primary'
			: 'text-admin-text-secondary';
</script>

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div
		class="flex items-center justify-between gap-2.5 border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
	>
		<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
			Search users
		</h3>

		<div class="flex items-center gap-3">
			<label for="users_search_pagesize" class="text-xs text-admin-text-muted">Page size</label>
			<select
				id="users_search_pagesize"
				bind:value={searchPageSize}
				onchange={onPageSizeChanged}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-2 py-1 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover"
			>
				<option value={10}>10</option>
				<option value={20}>20</option>
				<option value={50}>50</option>
				<option value={100}>100</option>
			</select>
		</div>
	</div>

	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-2">
			<label for="users_search_query" class="text-xs text-admin-text-muted">Query</label>
			<input
				id="users_search_query"
				bind:value={searchQuery}
				class="w-full rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover"
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
				class="rounded-sm bg-admin-accent-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				Search
			</button>

			{#if searchedOnce}
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2">
						<button
							type="button"
							class={modeButtonClass('guid')}
							onclick={() => (mode = 'guid')}
							disabled={loading}
						>
							GUID
						</button>
						<button
							type="button"
							class={modeButtonClass('username')}
							onclick={() => (mode = 'username')}
							disabled={loading}
						>
							Username
						</button>
						<button
							type="button"
							class={modeButtonClass('email')}
							onclick={() => (mode = 'email')}
							disabled={loading}
						>
							Email
						</button>
					</div>

					<div class="text-admin-border-primary select-none">|</div>

					<RoleFilterButtons bind:value={roleFilter} disabled={loading || !hasAnySearchResults} />
				</div>
			{/if}
		</div>

		{#if error}<div class="text-sm text-admin-danger-text">{error}</div>{/if}

		{#if loading}
			<div class="text-sm text-admin-text-muted"><LoadingDots /></div>
		{:else if searchedOnce}
			<div class="overflow-hidden rounded border border-admin-border-primary">
				<div
					class="flex items-center justify-between gap-3 border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
				>
					<div class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
						Query matches
					</div>

					{#if mode === 'username'}
						<div class="flex flex-wrap items-center gap-3">
							<div class="text-xs text-admin-text-muted">
								Total: {searchResult.username.totalItems}
							</div>
							<div class="text-xs text-admin-text-muted">
								Showing: {filteredUsernameItems.length}
							</div>
							<div class="text-xs text-admin-text-muted">
								Page {searchResult.username.currPage} / {usernameTotalPages}
							</div>
							<button
								type="button"
								onclick={onUsernamePrev}
								disabled={!searchResult.username.prevCursor}
								class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Prev
							</button>
							<button
								type="button"
								onclick={onUsernameNext}
								disabled={!searchResult.username.nextCursor}
								class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Next
							</button>
						</div>
					{:else if mode === 'email'}
						<div class="flex flex-wrap items-center gap-3">
							<div class="text-xs text-admin-text-muted">
								Total: {searchResult.email.totalItems}
							</div>
							<div class="text-xs text-admin-text-muted">Showing: {filteredEmailItems.length}</div>
							<div class="text-xs text-admin-text-muted">
								Page {searchResult.email.currPage} / {emailTotalPages}
							</div>
							<button
								type="button"
								onclick={onEmailPrev}
								disabled={!searchResult.email.prevCursor}
								class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Prev
							</button>
							<button
								type="button"
								onclick={onEmailNext}
								disabled={!searchResult.email.nextCursor}
								class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Next
							</button>
						</div>
					{:else}
						<div class="text-xs text-admin-text-muted">GUID match</div>
					{/if}
				</div>

				<div class="p-4">
					{#if mode === 'guid'}
						{#if searchResult.idMatch && !idMatchHiddenByFilter}
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div class="flex flex-col gap-1">
									<div class="font-mono text-xs break-all text-admin-text-muted">
										{@html highlight(searchResult.idMatch.userId, searchQuery)}
									</div>
									<div class="text-sm text-admin-text-primary">{searchResult.idMatch.username}</div>
									<div class="text-xs text-admin-text-muted">{searchResult.idMatch.email}</div>
									<div class="text-xs text-admin-text-muted">
										{(searchResult.idMatch.roles ?? []).join(', ')}
									</div>
								</div>

								<button
									type="button"
									onclick={() => onToggleSelectMaybe(searchResult.idMatch)}
									{disabled}
									class={selectButtonClass(searchResult.idMatch)}
								>
									{selectLabel(searchResult.idMatch)}
								</button>
							</div>
						{:else if searchResult.idMatch && idMatchHiddenByFilter}
							<div class="text-sm text-admin-text-muted">
								GUID match exists, but it’s hidden by the current role filter.
							</div>
						{:else}
							<div class="text-sm text-admin-text-muted">No GUID match.</div>
						{/if}
					{:else if mode === 'username' && searchResult.username.totalItems === 0}
						<div class="text-sm text-admin-text-muted">No matches.</div>
					{:else if mode === 'email' && searchResult.email.totalItems === 0}
						<div class="text-sm text-admin-text-muted">No matches.</div>
					{:else if mode === 'username' && filteredUsernameItems.length === 0}
						<div class="text-sm text-admin-text-muted">
							No matches for selected role filter on this page.
						</div>
					{:else if mode === 'email' && filteredEmailItems.length === 0}
						<div class="text-sm text-admin-text-muted">
							No matches for selected role filter on this page.
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full border-collapse text-sm">
								<thead>
									<tr class="text-left text-admin-text-primary">
										<th class="border-b border-admin-border-primary py-2 pr-4">User ID</th>
										<th class="border-b border-admin-border-primary py-2 pr-4">Username</th>
										<th class="border-b border-admin-border-primary py-2 pr-4">Email</th>
										<th class="border-b border-admin-border-primary py-2 pr-4">Roles</th>
										<th class="border-b border-admin-border-primary py-2 pr-0"></th>
									</tr>
								</thead>
								<tbody>
									{#each mode === 'username' ? filteredUsernameItems : filteredEmailItems as u (u.userId)}
										<tr class={tableRowClass(u)}>
											<td
												class="border-b border-admin-border-primary py-2 pr-4 font-mono text-xs break-all"
												>{u.userId}</td
											>
											<td class="border-b border-admin-border-primary py-2 pr-4">
												{#if mode === 'username'}
													<span class="text-admin-text-primary"
														>{@html highlight(u.username, searchQuery)}</span
													>
												{:else}
													{u.username}
												{/if}
											</td>
											<td class="border-b border-admin-border-primary py-2 pr-4">
												{#if mode === 'email'}
													<span class="text-admin-text-primary"
														>{@html highlight(u.email, searchQuery)}</span
													>
												{:else}
													{u.email}
												{/if}
											</td>
											<td class="border-b border-admin-border-primary py-2 pr-4"
												>{(u.roles ?? []).join(', ')}</td
											>
											<td class="border-b border-admin-border-primary py-2 pr-0 text-right">
												<button
													type="button"
													onclick={() => onToggleSelect(u)}
													{disabled}
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

					{#if !hasAnySearchResults}
						<div class="mt-3 text-sm text-admin-text-muted">No results.</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="text-sm text-admin-text-muted">Type a query and click Search.</div>
		{/if}
	</div>
</div>
