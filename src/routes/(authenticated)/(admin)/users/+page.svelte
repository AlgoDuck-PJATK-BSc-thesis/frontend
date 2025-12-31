<script lang="ts">
	import { FetchJsonFromApi } from '$lib/api/apiCall';

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

	type Mode = 'all' | 'search';

	let mode = $state<Mode>('all');

	let allPage = $state(1);
	let allPageSize = $state(20);
	let allLoadedOnce = $state(false);

	let searchQuery = $state('');
	let searchPageSize = $state(20);

	let usernamePage = $state(1);
	let emailPage = $state(1);

	let loading = $state(false);
	let error = $state<string | null>(null);

	let allResult = $state<PageData<UserRow>>({
		items: [],
		currPage: 1,
		pageSize: 20,
		totalItems: 0,
		prevCursor: null,
		nextCursor: null
	});

	let searchResult = $state<SearchUsersResult>({
		idMatch: null,
		username: { items: [], currPage: 1, pageSize: 20, totalItems: 0, prevCursor: null, nextCursor: null },
		email: { items: [], currPage: 1, pageSize: 20, totalItems: 0, prevCursor: null, nextCursor: null }
	});

	let searchedOnce = $state(false);

	let reqSeq = 0;

	const fetchWithTimeout: typeof fetch = (input, init) => {
		const controller = new AbortController();
		const t = setTimeout(() => controller.abort(), 15000);
		const merged = { ...(init ?? {}), signal: controller.signal };
		return fetch(input, merged).finally(() => clearTimeout(t));
	};

	const totalPages = (totalItems: number, pageSize: number) => Math.max(1, Math.ceil(totalItems / pageSize));

	const usernameTotalPages = $derived(totalPages(searchResult.username.totalItems, searchResult.username.pageSize));
	const emailTotalPages = $derived(totalPages(searchResult.email.totalItems, searchResult.email.pageSize));

	const resetSearchResult = () => {
		searchResult = {
			idMatch: null,
			username: {
				items: [],
				currPage: usernamePage,
				pageSize: searchPageSize,
				totalItems: 0,
				prevCursor: null,
				nextCursor: null
			},
			email: {
				items: [],
				currPage: emailPage,
				pageSize: searchPageSize,
				totalItems: 0,
				prevCursor: null,
				nextCursor: null
			}
		};
	};

	const loadAll = async () => {
		const my = ++reqSeq;
		loading = true;
		error = null;

		const params = new URLSearchParams();
		params.set('page', String(allPage));
		params.set('pageSize', String(allPageSize));

		try {
			const data = await FetchJsonFromApi<PageData<UserRow>>(
				'admin/users',
				{ method: 'GET' },
				fetchWithTimeout,
				params
			);
			if (my !== reqSeq) return;
			allResult = data;
			allPage = data.currPage;
			allPageSize = data.pageSize;
			allLoadedOnce = true;
		} catch (e) {
			if (my !== reqSeq) return;
			error = e instanceof Error ? e.message : 'Failed to load users.';
			allLoadedOnce = true;
			allResult = {
				items: [],
				currPage: allPage,
				pageSize: allPageSize,
				totalItems: 0,
				prevCursor: null,
				nextCursor: null
			};
		} finally {
			if (my === reqSeq) loading = false;
		}
	};

	const runSearch = async () => {
		const q = searchQuery.trim();
		if (!q) return;

		const my = ++reqSeq;
		loading = true;
		error = null;

		const params = new URLSearchParams();
		params.set('query', q);
		params.set('usernamePage', String(usernamePage));
		params.set('usernamePageSize', String(searchPageSize));
		params.set('emailPage', String(emailPage));
		params.set('emailPageSize', String(searchPageSize));

		try {
			const data = await FetchJsonFromApi<SearchUsersResult>(
				'admin/users/search',
				{ method: 'GET' },
				fetchWithTimeout,
				params
			);
			if (my !== reqSeq) return;

			searchResult = data;

			usernamePage = data.username.currPage;
			emailPage = data.email.currPage;

			searchPageSize = data.username.pageSize;

			searchedOnce = true;
		} catch (e) {
			if (my !== reqSeq) return;
			error = e instanceof Error ? e.message : 'Failed to search users.';
			resetSearchResult();
			searchedOnce = true;
		} finally {
			if (my === reqSeq) loading = false;
		}
	};

	const switchMode = (next: Mode) => {
		reqSeq += 1;
		loading = false;
		error = null;
		mode = next;

		if (next === 'search') {
			searchedOnce = false;
			searchQuery = '';
			usernamePage = 1;
			emailPage = 1;
			resetSearchResult();
		}
	};

	const allPrev = async () => {
		if (!allResult.prevCursor) return;
		allPage = allResult.prevCursor;
		await loadAll();
	};

	const allNext = async () => {
		if (!allResult.nextCursor) return;
		allPage = allResult.nextCursor;
		await loadAll();
	};

	const usernamePrev = async () => {
		if (!searchResult.username.prevCursor) return;
		usernamePage = searchResult.username.prevCursor;
		await runSearch();
	};

	const usernameNext = async () => {
		if (!searchResult.username.nextCursor) return;
		usernamePage = searchResult.username.nextCursor;
		await runSearch();
	};

	const emailPrev = async () => {
		if (!searchResult.email.prevCursor) return;
		emailPage = searchResult.email.prevCursor;
		await runSearch();
	};

	const emailNext = async () => {
		if (!searchResult.email.nextCursor) return;
		emailPage = searchResult.email.nextCursor;
		await runSearch();
	};
</script>

<main class="w-full min-h-screen bg-[#1e1e1e] text-[#cccccc] font-sans">
	<div class="max-w-6xl mx-auto p-6 flex flex-col gap-6">
		<div class="py-4 border-b border-[#3c3c3c] mb-2 flex items-end justify-between">
			<h2 class="text-2xl font-normal text-[#e7e7e7] tracking-tight">Users</h2>

			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={() => switchMode('all')}
					class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border ${
						mode === 'all'
							? 'bg-[#0e639c] text-white border-[#0e639c]'
							: 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'
					}`}
				>
					ALL
				</button>
				<button
					type="button"
					onclick={() => switchMode('search')}
					class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border ${
						mode === 'search'
							? 'bg-[#0e639c] text-white border-[#0e639c]'
							: 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'
					}`}
				>
					SEARCH
				</button>
			</div>
		</div>

		{#if mode === 'all'}
			<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
				<div class="flex items-center justify-between gap-2.5 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
					<h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">All users</h3>

					<div class="flex items-center gap-3">
						<label for="users_all_pagesize" class="text-xs text-[#a8a8a8]">Page size</label>
						<select
							id="users_all_pagesize"
							bind:value={allPageSize}
							class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-2 py-1 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4]"
						>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>

						<button
							type="button"
							onclick={async () => {
								allPage = 1;
								await loadAll();
							}}
							disabled={loading}
							class="ml-3 px-3 py-1.5 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Load
						</button>

						<div class="ml-4 flex items-center gap-2">
							<button
								type="button"
								onclick={allPrev}
								disabled={loading || !allLoadedOnce || !allResult.prevCursor}
								class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Prev
							</button>

							<div class="text-xs text-[#a8a8a8]">
								Page {allResult.currPage} / {totalPages(allResult.totalItems, allResult.pageSize)}
							</div>

							<button
								type="button"
								onclick={allNext}
								disabled={loading || !allLoadedOnce || !allResult.nextCursor}
								class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Next
							</button>
						</div>
					</div>
				</div>

				<div class="p-4">
					{#if error}
						<div class="text-sm text-[#ffb4b4] mb-3">{error}</div>
					{/if}

					{#if loading}
						<div class="text-sm text-[#a8a8a8] loading-line">
							Loading<span class="dot">.</span><span class="dot d2">.</span><span class="dot d3">.</span>
						</div>
					{:else if !allLoadedOnce}
						<div class="text-sm text-[#a8a8a8]">Click Load to fetch users.</div>
					{:else if allResult.items.length === 0}
						<div class="text-sm text-[#a8a8a8]">No users.</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-sm border-collapse">
								<thead>
									<tr class="text-left text-[#e7e7e7]">
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">User</th>
										<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
										<th class="py-2 pr-0 border-b border-[#3c3c3c]">Roles</th>
									</tr>
								</thead>
								<tbody>
									{#each allResult.items as u (u.userId)}
										<tr class="text-[#cccccc]">
											<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.username}</td>
											<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.email}</td>
											<td class="py-2 pr-0 border-b border-[#2a2a2a]">{u.roles.join(', ')}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
				<div class="flex items-center justify-between gap-2.5 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
					<h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Search users</h3>

					<div class="flex items-center gap-3">
						<label for="users_search_pagesize" class="text-xs text-[#a8a8a8]">Page size</label>
						<select
							id="users_search_pagesize"
							bind:value={searchPageSize}
							onchange={() => {
								usernamePage = 1;
								emailPage = 1;
								resetSearchResult();
							}}
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
							placeholder="Username, email, or userId (GUID)"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									usernamePage = 1;
									emailPage = 1;
									runSearch();
								}
							}}
						/>
					</div>

					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => {
								usernamePage = 1;
								emailPage = 1;
								runSearch();
							}}
							disabled={loading || !searchQuery.trim()}
							class="px-3 py-1.5 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Search
						</button>
					</div>

					{#if error}
						<div class="text-sm text-[#ffb4b4]">{error}</div>
					{/if}

					{#if loading}
						<div class="text-sm text-[#a8a8a8] loading-line">
							Loading<span class="dot">.</span><span class="dot d2">.</span><span class="dot d3">.</span>
						</div>
					{:else if searchedOnce}
						{#if searchResult.idMatch}
							<div class="border border-[#3c3c3c] rounded bg-[#1f1f1f] px-4 py-3">
								<div class="text-xs text-[#a8a8a8] uppercase tracking-wider">ID match</div>
								<div class="mt-2 flex flex-col gap-1">
									<div class="text-sm text-[#e7e7e7]">{searchResult.idMatch.username}</div>
									<div class="text-xs text-[#a8a8a8]">{searchResult.idMatch.email}</div>
									<div class="text-xs text-[#a8a8a8]">{searchResult.idMatch.roles.join(', ')}</div>
								</div>
							</div>
						{/if}

						<div class="border border-[#3c3c3c] rounded overflow-hidden">
							<div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center justify-between gap-3">
								<div class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Username matches</div>
								<div class="flex items-center gap-3">
									<div class="text-xs text-[#a8a8a8]">Total: {searchResult.username.totalItems}</div>
									<div class="text-xs text-[#a8a8a8]">Page {searchResult.username.currPage} / {usernameTotalPages}</div>
									<button
										type="button"
										onclick={usernamePrev}
										disabled={loading || !searchResult.username.prevCursor}
										class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Prev
									</button>
									<button
										type="button"
										onclick={usernameNext}
										disabled={loading || !searchResult.username.nextCursor}
										class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next
									</button>
								</div>
							</div>

							<div class="p-4">
								{#if searchResult.username.totalItems === 0}
									<div class="text-sm text-[#a8a8a8]">No username matches.</div>
								{:else}
									<div class="overflow-x-auto">
										<table class="w-full text-sm border-collapse">
											<thead>
												<tr class="text-left text-[#e7e7e7]">
													<th class="py-2 pr-4 border-b border-[#3c3c3c]">User</th>
													<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
													<th class="py-2 pr-0 border-b border-[#3c3c3c]">Roles</th>
												</tr>
											</thead>
											<tbody>
												{#each searchResult.username.items as u (u.userId)}
													<tr class="text-[#cccccc]">
														<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.username}</td>
														<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.email}</td>
														<td class="py-2 pr-0 border-b border-[#2a2a2a]">{u.roles.join(', ')}</td>
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
								<div class="flex items-center gap-3">
									<div class="text-xs text-[#a8a8a8]">Total: {searchResult.email.totalItems}</div>
									<div class="text-xs text-[#a8a8a8]">Page {searchResult.email.currPage} / {emailTotalPages}</div>
									<button
										type="button"
										onclick={emailPrev}
										disabled={loading || !searchResult.email.prevCursor}
										class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Prev
									</button>
									<button
										type="button"
										onclick={emailNext}
										disabled={loading || !searchResult.email.nextCursor}
										class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next
									</button>
								</div>
							</div>

							<div class="p-4">
								{#if searchResult.email.totalItems === 0}
									<div class="text-sm text-[#a8a8a8]">No email matches.</div>
								{:else}
									<div class="overflow-x-auto">
										<table class="w-full text-sm border-collapse">
											<thead>
												<tr class="text-left text-[#e7e7e7]">
													<th class="py-2 pr-4 border-b border-[#3c3c3c]">User</th>
													<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
													<th class="py-2 pr-0 border-b border-[#3c3c3c]">Roles</th>
												</tr>
											</thead>
											<tbody>
												{#each searchResult.email.items as u (u.userId)}
													<tr class="text-[#cccccc]">
														<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.username}</td>
														<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.email}</td>
														<td class="py-2 pr-0 border-b border-[#2a2a2a]">{u.roles.join(', ')}</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{/if}
							</div>
						</div>

						{#if !searchResult.idMatch && searchResult.username.totalItems === 0 && searchResult.email.totalItems === 0}
							<div class="text-sm text-[#a8a8a8]">No results.</div>
						{/if}
					{:else}
						<div class="text-sm text-[#a8a8a8]">Enter a query and click Search.</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</main>

<style>
	.loading-line {
		display: inline-flex;
		align-items: baseline;
		gap: 0;
	}

	.dot {
		display: inline-block;
		width: 0.35em;
		animation: dotblink 1.2s infinite ease-in-out;
	}

	.d2 {
		animation-delay: 0.15s;
	}

	.d3 {
		animation-delay: 0.3s;
	}

	@keyframes dotblink {
		0% {
			opacity: 0.15;
		}
		20% {
			opacity: 1;
		}
		100% {
			opacity: 0.15;
		}
	}
</style>
