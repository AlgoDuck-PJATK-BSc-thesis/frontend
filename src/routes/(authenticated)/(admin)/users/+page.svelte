<script lang="ts">
	import { onMount } from 'svelte';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	import UserCreateForm from './Forms/UserCreateForm.svelte';
	import UserUpdateForm from './Forms/UserUpdateForm.svelte';
	import UserDeleteForm from './Forms/UserDeleteForm.svelte';

	import UsersHeader from './UsersHeader.svelte';
	import SelectedUsersPanel from './Panels/SelectedUsersPanel.svelte';
	import UsersAllPanel from './Panels/UsersAllPanel.svelte';
	import UsersSearchPanel from './Panels/UsersSearchPanel.svelte';

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

	type Tab = 'all' | 'search' | 'create' | 'update' | 'delete';
	type RoleFilter = 'all' | 'users' | 'admins';
	type CreateRole = 'user' | 'admin';
	type UpdateRole = 'keep' | 'user' | 'admin';

	type CreateUserResult = {
		userId: string;
		email: string;
		username: string;
		role: string;
		emailVerified: boolean;
	};

	type UpdateUserResult = {
		userId: string;
		email: string;
		username: string;
		roles: string[];
	};

	type SelectionSnapshotV2 = {
		version: 2;
		selectedRoleFilter: RoleFilter;
		allRoleFilter: RoleFilter;
		searchRoleFilter: RoleFilter;
		selectedUsers: UserRow[];
		selectedExpanded: Record<string, boolean>;
		selectedOpen: boolean;
		activeUserId: string | null;
	};

	const UserCreateFormAny = UserCreateForm as unknown as any;
	const UserUpdateFormAny = UserUpdateForm as unknown as any;
	const UserDeleteFormAny = UserDeleteForm as unknown as any;

	const UsersHeaderAny = UsersHeader as unknown as any;
	const SelectedUsersPanelAny = SelectedUsersPanel as unknown as any;
	const UsersAllPanelAny = UsersAllPanel as unknown as any;
	const UsersSearchPanelAny = UsersSearchPanel as unknown as any;

	let tab = $state<Tab>('create');

	let selectedRoleFilter = $state<RoleFilter>('all');
	let allRoleFilter = $state<RoleFilter>('all');
	let searchRoleFilter = $state<RoleFilter>('all');

	let allPage = $state(1);
	let allPageSize = $state(20);
	let allLoadedOnce = $state(false);

	let searchQuery = $state('');
	let searchPageSize = $state(20);
	let usernamePage = $state(1);
	let emailPage = $state(1);

	let loading = $state(false);
	let error = $state<string | null>(null);

	let selectedUsers = $state<UserRow[]>([]);
	let selectedExpanded = $state<Record<string, boolean>>({});
	let selectedOpen = $state(true);
	let activeUserId = $state<string | null>(null);

	let creating = $state(false);
	let createError = $state<string | null>(null);
	let createdUser = $state<CreateUserResult | null>(null);

	let saving = $state(false);
	let updateError = $state<string | null>(null);
	let updateSuccess = $state<UpdateUserResult | null>(null);

	let deleting = $state(false);
	let deleteError = $state<string | null>(null);

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
		username: {
			items: [],
			currPage: 1,
			pageSize: 20,
			totalItems: 0,
			prevCursor: null,
			nextCursor: null
		},
		email: {
			items: [],
			currPage: 1,
			pageSize: 20,
			totalItems: 0,
			prevCursor: null,
			nextCursor: null
		}
	});

	let searchedOnce = $state(false);
	let reqSeq = 0;
	let verifySeq = 0;

	const storageKey = 'algoduck_admin_users_selection_v2';
	let storageReady = $state(false);

	const fetchWithTimeout: typeof fetch = (input, init) => {
		const controller = new AbortController();
		const t = setTimeout(() => controller.abort(), 15000);
		const merged = { ...(init ?? {}), signal: controller.signal };
		return fetch(input, merged).finally(() => clearTimeout(t));
	};

	const unwrap = <T,>(res: unknown): T | null => {
		const anyRes = res as { body?: T } | null;
		if (anyRes && typeof anyRes === 'object' && 'body' in anyRes)
			return (anyRes as { body?: T }).body ?? null;
		return (res as T) ?? null;
	};

	const isAdminRoles = (roles: string[]) => (roles ?? []).some((r) => r.toLowerCase() === 'admin');

	const passesRoleFilter = (filter: RoleFilter, u: UserRow) => {
		if (filter === 'all') return true;
		const isAdmin = isAdminRoles(u.roles ?? []);
		if (filter === 'admins') return isAdmin;
		return !isAdmin;
	};

	const filterRows = (filter: RoleFilter, rows: UserRow[]) =>
		(rows ?? []).filter((u) => passesRoleFilter(filter, u));

	const filteredAllItems = $derived(filterRows(allRoleFilter, allResult.items));
	const filteredUsernameItems = $derived(filterRows(searchRoleFilter, searchResult.username.items));
	const filteredEmailItems = $derived(filterRows(searchRoleFilter, searchResult.email.items));
	const selectedFiltered = $derived(filterRows(selectedRoleFilter, selectedUsers));

	const selectedUserIds = $derived(selectedUsers.map((u) => u.userId));

	const totalPages = (totalItems: number, pageSize: number) =>
		Math.max(1, Math.ceil(totalItems / pageSize));
	const allTotalPages = $derived(totalPages(allResult.totalItems, allResult.pageSize));
	const usernameTotalPages = $derived(
		totalPages(searchResult.username.totalItems, searchResult.username.pageSize)
	);
	const emailTotalPages = $derived(
		totalPages(searchResult.email.totalItems, searchResult.email.pageSize)
	);

	const hasAnySearchResults = $derived(
		Boolean(searchResult.idMatch) ||
			searchResult.username.totalItems > 0 ||
			searchResult.email.totalItems > 0
	);

	const idMatchHiddenByFilter = $derived(
		Boolean(searchResult.idMatch) &&
			!passesRoleFilter(searchRoleFilter, searchResult.idMatch as UserRow)
	);

	const activeUser = $derived(
		activeUserId ? (selectedUsers.find((u) => u.userId === activeUserId) ?? null) : null
	);

	const isSelected = (userId: string) => selectedUsers.some((u) => u.userId === userId);

	const normalizeRoles = (roles: string[]) =>
		(roles ?? [])
			.slice()
			.map((r) => r.toLowerCase())
			.sort()
			.join('|');

	const ensureActive = () => {
		if (activeUserId && selectedUsers.some((u) => u.userId === activeUserId)) return;
		activeUserId = selectedUsers.length > 0 ? selectedUsers[selectedUsers.length - 1].userId : null;
	};

	const setActive = (userId: string) => {
		activeUserId = userId;
		selectedOpen = true;
	};

	const addSelected = (u: UserRow) => {
		if (!selectedUsers.some((x) => x.userId === u.userId)) {
			selectedUsers = [...selectedUsers, u];
			selectedExpanded = { ...selectedExpanded, [u.userId]: false };
		}
		activeUserId = u.userId;
		selectedOpen = true;
	};

	const removeSelected = (userId: string) => {
		selectedUsers = selectedUsers.filter((u) => u.userId !== userId);
		const { [userId]: _d, ...rest } = selectedExpanded;
		selectedExpanded = rest;
		if (activeUserId === userId) ensureActive();
	};

	const removeSelectedMany = (ids: string[]) => {
		if (ids.length === 0) return;
		const idSet = new Set(ids);
		selectedUsers = selectedUsers.filter((u) => !idSet.has(u.userId));
		const nextExpanded: Record<string, boolean> = {};
		for (const u of selectedUsers) nextExpanded[u.userId] = Boolean(selectedExpanded[u.userId]);
		selectedExpanded = nextExpanded;
		if (activeUserId && idSet.has(activeUserId)) ensureActive();
	};

	const toggleSelect = (u: UserRow) => {
		if (isSelected(u.userId)) removeSelected(u.userId);
		else addSelected(u);
	};

	const toggleSelectMaybe = (u: UserRow | null) => {
		if (u) toggleSelect(u);
	};

	const clearAllSelected = () => {
		selectedUsers = [];
		selectedExpanded = {};
		activeUserId = null;
		selectedOpen = true;
	};

	const toggleSelectedSection = () => {
		selectedOpen = !selectedOpen;
	};

	const toggleSelectedDetails = (userId: string) => {
		selectedExpanded = { ...selectedExpanded, [userId]: !selectedExpanded[userId] };
		setActive(userId);
	};

	const expandAllSelected = () => {
		selectedOpen = true;
		const next: Record<string, boolean> = {};
		for (const u of selectedUsers) next[u.userId] = true;
		selectedExpanded = next;
	};

	const collapseAllSelected = () => {
		const next: Record<string, boolean> = {};
		for (const u of selectedUsers) next[u.userId] = false;
		selectedExpanded = next;
	};

	const refreshSelectedFrom = (rows: UserRow[]) => {
		if (selectedUsers.length === 0) return;
		const map = new Map((rows ?? []).map((r) => [r.userId, r] as const));
		let changed = false;
		const next = selectedUsers.map((u) => {
			const newer = map.get(u.userId);
			if (!newer) return u;
			const same =
				newer.email === u.email &&
				newer.username === u.username &&
				normalizeRoles(newer.roles ?? []) === normalizeRoles(u.roles ?? []);
			if (same) return u;
			changed = true;
			return newer;
		});
		if (changed) selectedUsers = next;
	};

	const pruneDeletedSelected = async () => {
		if (selectedUsers.length === 0) return;
		const my = ++verifySeq;

		const ids = selectedUsers.map((u) => u.userId).filter(Boolean);
		const toRemove: string[] = [];

		for (const id of ids) {
			if (my !== verifySeq) return;

			try {
				const params = new URLSearchParams();
				params.set('query', id);
				params.set('usernamePage', '1');
				params.set('usernamePageSize', '1');
				params.set('emailPage', '1');
				params.set('emailPageSize', '1');

				const res = await FetchFromApi<SearchUsersResult>(
					'admin/users/search',
					{ method: 'GET' },
					fetchWithTimeout,
					params
				);

				const body = unwrap<SearchUsersResult>(res as StandardResponseDto<SearchUsersResult>);
				const idMatch = body?.idMatch ?? null;

				if (!idMatch || String((idMatch as any)?.userId ?? '') !== id) {
					toRemove.push(id);
				}
			} catch {}
		}

		if (my !== verifySeq) return;
		removeSelectedMany(toRemove);
	};

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

	const switchTab = (next: Tab) => {
		reqSeq += 1;
		verifySeq += 1;

		loading = false;
		error = null;
		createError = null;
		updateError = null;
		deleteError = null;
		createdUser = null;
		updateSuccess = null;

		tab = next;

		if (next === 'search') {
			searchedOnce = false;
			searchQuery = '';
			usernamePage = 1;
			emailPage = 1;
			resetSearchResult();
		}
	};

	const loadAll = async () => {
		const my = ++reqSeq;
		loading = true;
		error = null;

		const params = new URLSearchParams();
		params.set('page', String(allPage));
		params.set('pageSize', String(allPageSize));

		try {
			const res = await FetchFromApi<PageData<UserRow>>(
				'admin/users',
				{ method: 'GET' },
				fetchWithTimeout,
				params
			);
			if (my !== reqSeq) return;

			const body = unwrap<PageData<UserRow>>(res as StandardResponseDto<PageData<UserRow>>);
			allResult = body ?? {
				items: [],
				currPage: allPage,
				pageSize: allPageSize,
				totalItems: 0,
				prevCursor: null,
				nextCursor: null
			};

			allPage = allResult.currPage;
			allPageSize = allResult.pageSize;

			allLoadedOnce = true;
			refreshSelectedFrom(allResult.items);
			void pruneDeletedSelected();
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
			const res = await FetchFromApi<SearchUsersResult>(
				'admin/users/search',
				{ method: 'GET' },
				fetchWithTimeout,
				params
			);
			if (my !== reqSeq) return;

			const body = unwrap<SearchUsersResult>(res as StandardResponseDto<SearchUsersResult>);
			searchResult = body ?? {
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

			usernamePage = searchResult.username.currPage;
			emailPage = searchResult.email.currPage;
			searchPageSize = searchResult.username.pageSize;

			searchedOnce = true;

			const merged = [
				...(searchResult.username.items ?? []),
				...(searchResult.email.items ?? []),
				...(searchResult.idMatch ? [searchResult.idMatch] : [])
			];
			refreshSelectedFrom(merged);
			void pruneDeletedSelected();
		} catch (e) {
			if (my !== reqSeq) return;
			error = e instanceof Error ? e.message : 'Failed to search users.';
			resetSearchResult();
			searchedOnce = true;
		} finally {
			if (my === reqSeq) loading = false;
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

	const onSearchFromStart = () => {
		usernamePage = 1;
		emailPage = 1;
		runSearch();
	};

	const onSearchPageSizeChanged = () => {
		usernamePage = 1;
		emailPage = 1;
		resetSearchResult();
	};

	const createUser = async (payload: {
		email: string;
		password: string;
		role: CreateRole;
		emailVerified: boolean;
		username: string | null;
	}) => {
		if (creating || saving || deleting) return;

		if (payload.role === 'admin') {
			const ok = confirm('Create a new admin account?');
			if (!ok) return;
		}

		createError = null;
		createdUser = null;
		creating = true;

		try {
			const res = await FetchFromApi<CreateUserResult>(
				'admin/users',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: payload.email,
						password: payload.password,
						role: payload.role,
						emailVerified: payload.emailVerified,
						username: payload.username
					})
				},
				fetchWithTimeout
			);

			const body = unwrap<CreateUserResult>(res as StandardResponseDto<CreateUserResult>);
			createdUser = body ?? null;

			if (createdUser) {
				addSelected({
					userId: createdUser.userId,
					email: createdUser.email,
					username: createdUser.username,
					roles: [createdUser.role]
				});
			}

			if (allLoadedOnce) {
				allPage = 1;
				await loadAll();
			}
		} catch (e) {
			createError = e instanceof Error ? e.message : 'Failed to create user.';
		} finally {
			creating = false;
		}
	};

	const updateUser = async (payload: {
		userId: string;
		username: string | null;
		role: UpdateRole;
		email?: string | null;
		password?: string | null;
	}) => {
		if (creating || saving || deleting) return;

		const bodyPayload: Record<string, string> = {};
		if (payload.username) bodyPayload.username = payload.username;
		if (payload.role !== 'keep') bodyPayload.role = payload.role;

		const emailTrimmed = payload.email ? payload.email.trim() : '';
		if (emailTrimmed) bodyPayload.email = emailTrimmed;

		if (payload.password) bodyPayload.password = payload.password;

		if (Object.keys(bodyPayload).length === 0) {
			updateError = 'No changes to save.';
			return;
		}

		if (payload.role === 'admin') {
			const ok = confirm('Promote this user to admin?');
			if (!ok) return;
		}

		updateError = null;
		updateSuccess = null;
		saving = true;

		try {
			const res = await FetchFromApi<UpdateUserResult>(
				`admin/users/${encodeURIComponent(payload.userId)}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(bodyPayload)
				},
				fetchWithTimeout
			);

			const body = unwrap<UpdateUserResult>(res as StandardResponseDto<UpdateUserResult>);
			updateSuccess = body ?? null;

			if (updateSuccess) {
				const updated: UserRow = {
					userId: updateSuccess.userId,
					email: updateSuccess.email,
					username: updateSuccess.username,
					roles: updateSuccess.roles ?? []
				};

				const idx = selectedUsers.findIndex((u) => u.userId === updated.userId);
				if (idx >= 0) {
					const next = [...selectedUsers];
					next[idx] = updated;
					selectedUsers = next;
				} else {
					selectedUsers = [...selectedUsers, updated];
					selectedExpanded = { ...selectedExpanded, [updated.userId]: false };
				}

				activeUserId = updated.userId;
				selectedOpen = true;
			}

			if (allLoadedOnce) await loadAll();
			if (searchedOnce && searchQuery.trim()) await runSearch();
		} catch (e) {
			updateError = e instanceof Error ? e.message : 'Failed to update user.';
		} finally {
			saving = false;
		}
	};

	const deleteUserNoConfirm = async (userId: string) => {
		await FetchFromApi(
			`admin/users/${encodeURIComponent(userId)}`,
			{ method: 'DELETE' },
			fetchWithTimeout
		);
		if (isSelected(userId)) removeSelected(userId);
	};

	const deleteUser = async (userId: string) => {
		if (creating || saving || deleting) return;

		const ok = confirm('Are you sure you want to delete this user? This cannot be undone.');
		if (!ok) return;

		deleteError = null;
		deleting = true;

		try {
			await deleteUserNoConfirm(userId);

			if (allLoadedOnce) await loadAll();
			if (searchedOnce && searchQuery.trim()) await runSearch();
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'Failed to delete user.';
		} finally {
			deleting = false;
		}
	};

	const deleteAllSelected = async () => {
		if (creating || saving || deleting) return;
		if (selectedUsers.length === 0) return;

		const ok = confirm(`Delete ${selectedUsers.length} selected user(s)? This cannot be undone.`);
		if (!ok) return;

		deleteError = null;
		deleting = true;

		const ids = selectedUsers.map((u) => u.userId);
		try {
			for (const id of ids) {
				await deleteUserNoConfirm(id);
			}

			if (allLoadedOnce) await loadAll();
			if (searchedOnce && searchQuery.trim()) await runSearch();
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'Failed to delete selected users.';
		} finally {
			deleting = false;
		}
	};

	onMount(() => {
		if (typeof window === 'undefined') return;

		const rawV2 = window.localStorage.getItem(storageKey);
		if (rawV2) {
			try {
				const parsed = JSON.parse(rawV2) as SelectionSnapshotV2;
				if (parsed && typeof parsed === 'object' && parsed.version === 2) {
					selectedRoleFilter = parsed.selectedRoleFilter ?? selectedRoleFilter;
					allRoleFilter = parsed.allRoleFilter ?? allRoleFilter;
					searchRoleFilter = parsed.searchRoleFilter ?? searchRoleFilter;

					selectedUsers = Array.isArray(parsed.selectedUsers) ? parsed.selectedUsers : [];
					selectedExpanded =
						parsed.selectedExpanded && typeof parsed.selectedExpanded === 'object'
							? parsed.selectedExpanded
							: {};
					selectedOpen = typeof parsed.selectedOpen === 'boolean' ? parsed.selectedOpen : true;
					activeUserId = typeof parsed.activeUserId === 'string' ? parsed.activeUserId : null;

					ensureActive();

					const fixedExpanded: Record<string, boolean> = {};
					for (const u of selectedUsers)
						fixedExpanded[u.userId] = Boolean(selectedExpanded[u.userId]);
					selectedExpanded = fixedExpanded;

					storageReady = true;
					void pruneDeletedSelected();
					return;
				}
			} catch {
				window.localStorage.removeItem(storageKey);
			}
		}

		storageReady = true;
		void pruneDeletedSelected();
	});

	$effect(() => {
		if (!storageReady) return;
		if (typeof window === 'undefined') return;

		const snapshot: SelectionSnapshotV2 = {
			version: 2,
			selectedRoleFilter,
			allRoleFilter,
			searchRoleFilter,
			selectedUsers,
			selectedExpanded,
			selectedOpen,
			activeUserId
		};

		try {
			window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
		} catch {
			window.localStorage.removeItem(storageKey);
		}
	});
</script>

<main class="min-h-screen w-full bg-admin-bg-primary text-admin-text-secondary">
	<div class="mx-auto flex max-w-6xl flex-col gap-6 p-6">
		<UsersHeaderAny {tab} onSwitchTab={switchTab} />

		{#if selectedUsers.length > 0 && tab !== 'create'}
			<SelectedUsersPanelAny
				bind:roleFilter={selectedRoleFilter}
				disabled={loading || creating || saving || deleting}
				{selectedUsers}
				{selectedFiltered}
				{selectedExpanded}
				{selectedOpen}
				{activeUserId}
				{activeUser}
				onToggleOpen={toggleSelectedSection}
				onExpandAll={expandAllSelected}
				onCollapseAll={collapseAllSelected}
				onClearAll={clearAllSelected}
				onSetActive={setActive}
				onToggleDetails={toggleSelectedDetails}
				onRemove={removeSelected}
			/>
		{/if}

		{#if tab === 'create'}
			<UserCreateFormAny
				disabled={loading || saving || deleting}
				{creating}
				error={createError}
				created={createdUser}
				onCreate={createUser}
			/>
		{/if}

		{#if tab === 'update'}
			<UserUpdateFormAny
				disabled={loading || creating || deleting}
				{saving}
				error={updateError}
				success={updateSuccess}
				initialUserId={activeUserId ?? ''}
				onUpdate={updateUser}
			/>
		{/if}

		{#if tab === 'delete'}
			<div class="flex items-center justify-end gap-3">
				<button
					type="button"
					onclick={deleteAllSelected}
					disabled={loading || creating || saving || deleting || selectedUsers.length === 0}
					class="rounded-sm bg-admin-danger-bg px-3 py-2 text-xs font-medium text-white hover:bg-admin-danger-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if deleting}
						<LoadingDots />
					{:else}
						Delete all selected ({selectedUsers.length})
					{/if}
				</button>
			</div>

			<UserDeleteFormAny
				disabled={loading || creating || saving}
				{deleting}
				error={deleteError}
				initialUserId={activeUserId ?? ''}
				onDelete={deleteUser}
			/>
		{/if}

		{#if tab === 'all'}
			<UsersAllPanelAny
				bind:roleFilter={allRoleFilter}
				bind:pageSize={allPageSize}
				{loading}
				{error}
				{allLoadedOnce}
				{allResult}
				filteredItems={filteredAllItems}
				{selectedUserIds}
				totalPages={allTotalPages}
				disabled={loading || creating || saving || deleting}
				onLoad={async () => {
					allPage = 1;
					await loadAll();
				}}
				onPrev={allPrev}
				onNext={allNext}
				onToggleSelect={toggleSelect}
			/>
		{/if}

		{#if tab === 'search'}
			<UsersSearchPanelAny
				bind:roleFilter={searchRoleFilter}
				bind:searchQuery
				bind:searchPageSize
				{loading}
				{error}
				{searchedOnce}
				{hasAnySearchResults}
				{searchResult}
				{filteredUsernameItems}
				{filteredEmailItems}
				{usernameTotalPages}
				{emailTotalPages}
				{idMatchHiddenByFilter}
				{selectedUserIds}
				disabled={loading || creating || saving || deleting}
				{onSearchFromStart}
				onPageSizeChanged={onSearchPageSizeChanged}
				onUsernamePrev={usernamePrev}
				onUsernameNext={usernameNext}
				onEmailPrev={emailPrev}
				onEmailNext={emailNext}
				onToggleSelect={toggleSelect}
				onToggleSelectMaybe={toggleSelectMaybe}
			/>
		{/if}
	</div>
</main>
