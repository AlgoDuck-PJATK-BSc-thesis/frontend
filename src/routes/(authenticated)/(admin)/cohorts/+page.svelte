<script lang="ts">
	import { onMount } from 'svelte';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import CohortsTable from './Tables/CohortsTable.svelte';
	import CohortMembersPanel from './Panels/CohortMembersPanel.svelte';

	import CohortsHeader from './CohortsHeader.svelte';
	import SelectedCohortsPanel from './Panels/SelectedCohortsPanel.svelte';
	import CreateCohortPanel from './Panels/CreateCohortPanel.svelte';
	import UpdateCohortPanel from './Panels/UpdateCohortPanel.svelte';
	import DeleteCohortPanel from './Panels/DeleteCohortPanel.svelte';

	const CohortsHeaderAny = CohortsHeader as unknown as any;
	const SelectedCohortsPanelAny = SelectedCohortsPanel as unknown as any;
	const CreateCohortPanelAny = CreateCohortPanel as unknown as any;
	const UpdateCohortPanelAny = UpdateCohortPanel as unknown as any;
	const DeleteCohortPanelAny = DeleteCohortPanel as unknown as any;
	const CohortsTableAny = CohortsTable as unknown as any;

	type PageData<T> = {
		items: T[];
		currPage: number;
		pageSize: number;
		totalItems: number;
		prevCursor: number | null;
		nextCursor: number | null;
	};

	type CohortRow = {
		cohortId: string;
		name: string;
		isActive: boolean;
		createdAt: string | null;
		createdByUserId: string | null;
		createdByDisplay: string;
	};

	type SearchCohortsResult = {
		idMatch: CohortRow | null;
		name: PageData<CohortRow>;
	};

	type CohortMemberRow = {
		userId: string;
		userName: string;
		email: string;
		joinedAt?: string | null;
	};

	type CohortMembersResult = {
		cohortId: string;
	};

	type CohortMembersState = {
		loaded: boolean;
		loading: boolean;
		error: string | null;
		totalMembers: number;
		members: CohortMemberRow[];
	};

	type Tab = 'all' | 'search' | 'create' | 'update' | 'delete';

	type CreateCohortResult = {
		cohortId: string;
		name: string;
		isActive?: boolean;
		createdAt?: string | null;
		createdByUserId?: string | null;
		createdByDisplay?: string;
	};

	type UpdateCohortResult = {
		cohortId: string;
		name: string;
		isActive?: boolean;
		createdAt?: string | null;
		createdByUserId?: string | null;
		createdByDisplay?: string;
	};

	type SelectionSnapshotV1 = {
		version: 1;
		selectedCohorts: CohortRow[];
		selectedExpanded: Record<string, boolean>;
		selectedOpen: boolean;
		activeCohortId: string | null;
	};

	let tab = $state<Tab>('create');

	let allPage = $state(1);
	let allPageSize = $state(20);
	let allLoadedOnce = $state(false);

	let searchQuery = $state('');
	let searchPage = $state(1);
	let searchPageSize = $state(20);

	let loading = $state(false);
	let error = $state<string | null>(null);

	let allResult = $state<PageData<CohortRow>>({
		items: [],
		currPage: 1,
		pageSize: 20,
		totalItems: 0,
		prevCursor: null,
		nextCursor: null
	});

	let searchResult = $state<SearchCohortsResult>({
		idMatch: null,
		name: {
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

	let expanded = $state<Record<string, boolean>>({});
	let membersByCohort = $state<Record<string, CohortMembersState>>({});

	let creating = $state(false);
	let createError = $state<string | null>(null);
	let createdCohort = $state<CreateCohortResult | null>(null);

	let saving = $state(false);
	let updateError = $state<string | null>(null);
	let updateSuccess = $state<UpdateCohortResult | null>(null);

	let deleting = $state(false);
	let deleteError = $state<string | null>(null);

	let selectedCohorts = $state<CohortRow[]>([]);
	let selectedExpanded = $state<Record<string, boolean>>({});
	let selectedOpen = $state(true);
	let activeCohortId = $state<string | null>(null);

	let validatingSelected = $state(false);

	const selectedCohortIds = $derived(selectedCohorts.map((c) => c.cohortId));
	const activeCohort = $derived(
		activeCohortId ? (selectedCohorts.find((c) => c.cohortId === activeCohortId) ?? null) : null
	);

	const storageKey = 'algoduck_admin_cohorts_selection_v1';
	let storageReady = $state(false);

	const normId = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();

	const fetchWithTimeout: typeof fetch = (input, init) => {
		const controller = new AbortController();
		const t = setTimeout(() => controller.abort(), 15000);
		const merged = { ...(init ?? {}), signal: controller.signal };
		return fetch(input, merged).finally(() => clearTimeout(t));
	};

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

	const totalPages = (totalItems: number, pageSize: number) =>
		Math.max(1, Math.ceil(totalItems / pageSize));

	const normalizeCreatedAt = (raw: any): string | null => {
		const v =
			raw?.createdAt ??
			raw?.created_at ??
			raw?.createdAtUtc ??
			raw?.createdAtISO ??
			raw?.createdAtIso;
		if (v === null || v === undefined) return null;
		if (typeof v === 'string') return v;
		return String(v);
	};

	const normalizeCohortRow = (raw: any): CohortRow => {
		const createdByUserId =
			raw?.createdByUserId === null || raw?.createdByUserId === undefined
				? null
				: String(raw.createdByUserId);

		const createdByDisplay =
			typeof raw?.createdByDisplay === 'string' && raw.createdByDisplay.trim()
				? raw.createdByDisplay
				: createdByUserId
					? createdByUserId
					: 'Deleted user';

		return {
			cohortId: String(raw?.cohortId ?? ''),
			name: String(raw?.name ?? ''),
			isActive: Boolean(raw?.isActive),
			createdAt: normalizeCreatedAt(raw),
			createdByUserId,
			createdByDisplay
		};
	};

	const normalizePageData = (raw: any): PageData<CohortRow> => {
		const itemsRaw = Array.isArray(raw?.items) ? raw.items : [];
		return {
			items: itemsRaw.map(normalizeCohortRow),
			currPage: typeof raw?.currPage === 'number' ? raw.currPage : 1,
			pageSize: typeof raw?.pageSize === 'number' ? raw.pageSize : allPageSize,
			totalItems: typeof raw?.totalItems === 'number' ? raw.totalItems : 0,
			prevCursor: raw?.prevCursor ?? null,
			nextCursor: raw?.nextCursor ?? null
		};
	};

	const resetSearchResult = () => {
		searchResult = {
			idMatch: null,
			name: {
				items: [],
				currPage: searchPage,
				pageSize: searchPageSize,
				totalItems: 0,
				prevCursor: null,
				nextCursor: null
			}
		};
	};

	const findSelected = (cohortId: string) =>
		selectedCohorts.find((c) => normId(c.cohortId) === normId(cohortId)) ?? null;

	const isSelected = (cohortId: string) => Boolean(findSelected(cohortId));

	const ensureActive = () => {
		if (!activeCohortId) {
			activeCohortId =
				selectedCohorts.length > 0 ? selectedCohorts[selectedCohorts.length - 1].cohortId : null;
			return;
		}

		const found = findSelected(activeCohortId);
		if (found) {
			activeCohortId = found.cohortId;
			return;
		}

		activeCohortId =
			selectedCohorts.length > 0 ? selectedCohorts[selectedCohorts.length - 1].cohortId : null;
	};

	const setActive = (cohortId: string) => {
		const found = findSelected(cohortId);
		activeCohortId = found ? found.cohortId : cohortId;
		selectedOpen = true;
	};

	const addSelected = (c: CohortRow) => {
		const exists = selectedCohorts.some((x) => normId(x.cohortId) === normId(c.cohortId));
		if (!exists) {
			selectedCohorts = [...selectedCohorts, c];
			selectedExpanded = { ...selectedExpanded, [c.cohortId]: false };
		}
		activeCohortId = c.cohortId;
		selectedOpen = true;
	};

	const removeSelected = (cohortId: string) => {
		const found = findSelected(cohortId);
		if (!found) return;

		const key = found.cohortId;

		selectedCohorts = selectedCohorts.filter((c) => normId(c.cohortId) !== normId(cohortId));

		const { [key]: _d, ...rest } = selectedExpanded;
		selectedExpanded = rest;

		if (activeCohortId && normId(activeCohortId) === normId(cohortId)) ensureActive();
	};

	const toggleSelect = (c: CohortRow) => {
		if (isSelected(c.cohortId)) removeSelected(c.cohortId);
		else addSelected(c);
	};

	const toggleSelectMaybe = (c: CohortRow | null) => {
		if (c) toggleSelect(c);
	};

	const clearAllSelected = () => {
		selectedCohorts = [];
		selectedExpanded = {};
		activeCohortId = null;
		selectedOpen = true;
	};

	const toggleSelectedSection = () => {
		selectedOpen = !selectedOpen;
	};

	const validateSelectedCohorts = async () => {
		if (validatingSelected) return;
		if (selectedCohorts.length === 0) return;

		validatingSelected = true;

		const ids = [...selectedCohorts].map((c) => c.cohortId);

		try {
			for (const id of ids) {
				const params = new URLSearchParams();
				params.set('query', id);
				params.set('page', '1');
				params.set('pageSize', '1');

				const res = await FetchFromApi<SearchCohortsResult>(
					'admin/cohorts/search',
					{ method: 'GET' },
					fetchWithTimeout,
					params
				);

				const body = (res as StandardResponseDto<SearchCohortsResult>).body;
				if (!body?.idMatch) removeSelected(id);
			}
		} finally {
			validatingSelected = false;
		}
	};

	const ensureMembersState = (cohortId: string) => {
		if (membersByCohort[cohortId]) return;
		membersByCohort = {
			...membersByCohort,
			[cohortId]: { loaded: false, loading: false, error: null, totalMembers: 0, members: [] }
		};
	};

	const loadMembers = async (cohortId: string) => {
		ensureMembersState(cohortId);

		const current = membersByCohort[cohortId];
		if (current.loading) return;

		membersByCohort = {
			...membersByCohort,
			[cohortId]: { ...current, loading: true, error: null }
		};

		try {
			const res = await FetchFromApi<
				CohortMembersResult & { totalMembers?: number; members?: CohortMemberRow[] }
			>(
				`admin/cohorts/${encodeURIComponent(cohortId)}/members`,
				{ method: 'GET' },
				fetchWithTimeout
			);

			const body = (res as StandardResponseDto<any>).body;

			const members = Array.isArray(body?.members) ? body.members : [];
			const total = typeof body?.totalMembers === 'number' ? body.totalMembers : members.length;

			membersByCohort = {
				...membersByCohort,
				[cohortId]: {
					loaded: true,
					loading: false,
					error: null,
					totalMembers: total,
					members
				}
			};
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to load cohort members.';
			const prev = membersByCohort[cohortId] ?? {
				loaded: false,
				loading: false,
				error: null,
				totalMembers: 0,
				members: []
			};

			membersByCohort = {
				...membersByCohort,
				[cohortId]: { ...prev, loading: false, error: msg }
			};
		}
	};

	const toggleSelectedDetails = (cohortId: string) => {
		const found = findSelected(cohortId);
		if (!found) return;

		const key = found.cohortId;
		const next = !selectedExpanded[key];

		selectedExpanded = { ...selectedExpanded, [key]: next };
		setActive(key);

		if (next) {
			ensureMembersState(key);
			const st = membersByCohort[key];
			if (!st.loaded && !st.loading) void loadMembers(key);
		}
	};

	const expandAllSelected = () => {
		selectedOpen = true;
		const next: Record<string, boolean> = {};
		for (const c of selectedCohorts) next[c.cohortId] = true;
		selectedExpanded = next;

		for (const c of selectedCohorts) {
			ensureMembersState(c.cohortId);
			const st = membersByCohort[c.cohortId];
			if (!st.loaded && !st.loading) void loadMembers(c.cohortId);
		}
	};

	const collapseAllSelected = () => {
		const next: Record<string, boolean> = {};
		for (const c of selectedCohorts) next[c.cohortId] = false;
		selectedExpanded = next;
	};

	const refreshSelectedFrom = (rows: CohortRow[]) => {
		if (selectedCohorts.length === 0) return;
		const map = new Map((rows ?? []).map((r) => [normId(r.cohortId), r] as const));
		let changed = false;
		const next = selectedCohorts.map((c) => {
			const newer = map.get(normId(c.cohortId));
			if (!newer) return c;
			const same =
				newer.name === c.name &&
				newer.isActive === c.isActive &&
				newer.createdAt === c.createdAt &&
				newer.createdByUserId === c.createdByUserId &&
				newer.createdByDisplay === c.createdByDisplay;
			if (same) return c;
			changed = true;
			return newer;
		});
		if (changed) selectedCohorts = next;
	};

	const toggleExpanded = async (cohortId: string) => {
		const next = !expanded[cohortId];
		expanded = { ...expanded, [cohortId]: next };

		if (next) {
			ensureMembersState(cohortId);
			if (!membersByCohort[cohortId].loaded) await loadMembers(cohortId);
		}
	};

	const collapseAllExpanded = () => {
		expanded = {};
	};

	const clearMembersCache = () => {
		membersByCohort = {};
	};

	const loadAll = async () => {
		const my = ++reqSeq;
		loading = true;
		error = null;

		const params = new URLSearchParams();
		params.set('page', String(allPage));
		params.set('pageSize', String(allPageSize));

		try {
			const res = await FetchFromApi<PageData<CohortRow>>(
				'admin/cohorts',
				{ method: 'GET' },
				fetchWithTimeout,
				params
			);

			if (my !== reqSeq) return;

			const body = (res as StandardResponseDto<PageData<CohortRow>>).body;
			const normalized = normalizePageData(body);

			allResult = normalized;

			allPage = allResult.currPage;
			allPageSize = allResult.pageSize;

			allLoadedOnce = true;
			collapseAllExpanded();

			refreshSelectedFrom(allResult.items);
			void validateSelectedCohorts();
		} catch (e) {
			if (my !== reqSeq) return;

			error = e instanceof Error ? e.message : 'Failed to load cohorts.';
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
		params.set('page', String(searchPage));
		params.set('pageSize', String(searchPageSize));

		try {
			const res = await FetchFromApi<SearchCohortsResult>(
				'admin/cohorts/search',
				{ method: 'GET' },
				fetchWithTimeout,
				params
			);

			if (my !== reqSeq) return;

			const body = (res as StandardResponseDto<SearchCohortsResult>).body;

			const idMatchRaw = body?.idMatch ?? null;
			const nameRaw = body?.name ?? null;

			searchResult = {
				idMatch: idMatchRaw ? normalizeCohortRow(idMatchRaw) : null,
				name: normalizePageData(nameRaw)
			};

			searchPage = searchResult.name.currPage;
			searchPageSize = searchResult.name.pageSize;

			searchedOnce = true;
			collapseAllExpanded();
			clearMembersCache();

			const merged = [
				...(searchResult.name.items ?? []),
				...(searchResult.idMatch ? [searchResult.idMatch] : [])
			];
			refreshSelectedFrom(merged);
			void validateSelectedCohorts();
		} catch (e) {
			if (my !== reqSeq) return;

			error = e instanceof Error ? e.message : 'Failed to search cohorts.';
			resetSearchResult();
			searchedOnce = true;
			collapseAllExpanded();
			clearMembersCache();
		} finally {
			if (my === reqSeq) loading = false;
		}
	};

	const switchTab = (next: Tab) => {
		reqSeq += 1;
		loading = false;
		error = null;

		createError = null;
		updateError = null;
		deleteError = null;
		createdCohort = null;
		updateSuccess = null;

		tab = next;

		collapseAllExpanded();
		clearMembersCache();

		if (next === 'search') {
			searchedOnce = false;
			searchQuery = '';
			searchPage = 1;
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

	const searchPrev = async () => {
		if (!searchResult.name.prevCursor) return;
		searchPage = searchResult.name.prevCursor;
		await runSearch();
	};

	const searchNext = async () => {
		if (!searchResult.name.nextCursor) return;
		searchPage = searchResult.name.nextCursor;
		await runSearch();
	};

	const rowDetailsId = (cohortId: string) => `cohort_details_${cohortId}`;

	const defaultMembersState = (): CohortMembersState => ({
		loaded: false,
		loading: false,
		error: null,
		totalMembers: 0,
		members: []
	});

	const createCohort = async (payload: { name: string }) => {
		if (creating || saving || deleting) return;

		const name = payload.name.trim();
		if (!name) return;

		createError = null;
		createdCohort = null;
		creating = true;

		try {
			const res = await FetchFromApi<CreateCohortResult>(
				'admin/cohorts',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name })
				},
				fetchWithTimeout
			);

			const body = (res as StandardResponseDto<CreateCohortResult>).body;
			createdCohort = body ?? null;

			if (createdCohort?.cohortId) {
				addSelected(normalizeCohortRow(createdCohort));
			}

			if (allLoadedOnce) {
				allPage = 1;
				await loadAll();
			}

			if (searchedOnce && searchQuery.trim()) {
				searchPage = 1;
				await runSearch();
			}
		} catch (e) {
			createError = e instanceof Error ? e.message : 'Failed to create cohort.';
		} finally {
			creating = false;
		}
	};

	const updateCohort = async (payload: { cohortId: string; name: string }) => {
		if (creating || saving || deleting) return;

		const cohortId = payload.cohortId.trim();
		const name = payload.name.trim();
		if (!cohortId || !name) return;

		updateError = null;
		updateSuccess = null;
		saving = true;

		try {
			const res = await FetchFromApi<UpdateCohortResult>(
				`admin/cohorts/${encodeURIComponent(cohortId)}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name })
				},
				fetchWithTimeout
			);

			const body = (res as StandardResponseDto<UpdateCohortResult>).body;
			updateSuccess = body ?? null;

			if (updateSuccess?.cohortId) {
				const updated = normalizeCohortRow(updateSuccess);
				const idx = selectedCohorts.findIndex(
					(c) => normId(c.cohortId) === normId(updated.cohortId)
				);
				if (idx >= 0) {
					const next = [...selectedCohorts];
					next[idx] = updated;
					selectedCohorts = next;
				} else {
					selectedCohorts = [...selectedCohorts, updated];
					selectedExpanded = { ...selectedExpanded, [updated.cohortId]: false };
				}
				activeCohortId = updated.cohortId;
				selectedOpen = true;
			}

			if (allLoadedOnce) await loadAll();
			if (searchedOnce && searchQuery.trim()) await runSearch();
		} catch (e) {
			updateError = e instanceof Error ? e.message : 'Failed to update cohort.';
		} finally {
			saving = false;
		}
	};

	const deleteCohortNoConfirm = async (cohortId: string) => {
		await FetchFromApi(
			`admin/cohorts/${encodeURIComponent(cohortId)}`,
			{ method: 'DELETE' },
			fetchWithTimeout
		);
		if (isSelected(cohortId)) removeSelected(cohortId);
	};

	const deleteCohort = async (cohortId: string) => {
		if (creating || saving || deleting) return;

		const ok = confirm('Are you sure you want to delete this cohort? This cannot be undone.');
		if (!ok) return;

		deleteError = null;
		deleting = true;

		try {
			await deleteCohortNoConfirm(cohortId);

			if (allLoadedOnce) await loadAll();
			if (searchedOnce && searchQuery.trim()) await runSearch();
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'Failed to delete cohort.';
		} finally {
			deleting = false;
		}
	};

	const deleteAllSelected = async () => {
		if (creating || saving || deleting) return;
		if (selectedCohorts.length === 0) return;

		const ok = confirm(
			`Delete ${selectedCohorts.length} selected cohort(s)? This cannot be undone.`
		);
		if (!ok) return;

		deleteError = null;
		deleting = true;

		const ids = selectedCohorts.map((c) => c.cohortId);

		try {
			for (const id of ids) {
				await deleteCohortNoConfirm(id);
			}

			if (allLoadedOnce) await loadAll();
			if (searchedOnce && searchQuery.trim()) await runSearch();
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'Failed to delete selected cohorts.';
		} finally {
			deleting = false;
		}
	};

	onMount(() => {
		if (typeof window === 'undefined') return;

		const raw = window.localStorage.getItem(storageKey);
		if (raw) {
			try {
				const parsed = JSON.parse(raw) as SelectionSnapshotV1;
				if (parsed && typeof parsed === 'object' && parsed.version === 1) {
					selectedCohorts = Array.isArray(parsed.selectedCohorts) ? parsed.selectedCohorts : [];
					selectedExpanded =
						parsed.selectedExpanded && typeof parsed.selectedExpanded === 'object'
							? parsed.selectedExpanded
							: {};
					selectedOpen = typeof parsed.selectedOpen === 'boolean' ? parsed.selectedOpen : true;
					activeCohortId = typeof parsed.activeCohortId === 'string' ? parsed.activeCohortId : null;

					ensureActive();

					const normalizedExpanded = new Map(
						Object.entries(selectedExpanded ?? {}).map(([k, v]) => [normId(k), Boolean(v)])
					);

					const fixedExpanded: Record<string, boolean> = {};
					for (const c of selectedCohorts)
						fixedExpanded[c.cohortId] = normalizedExpanded.get(normId(c.cohortId)) ?? false;
					selectedExpanded = fixedExpanded;

					storageReady = true;
					void validateSelectedCohorts();
					return;
				}
			} catch {
				window.localStorage.removeItem(storageKey);
			}
		}

		storageReady = true;
		void validateSelectedCohorts();
	});

	$effect(() => {
		if (!storageReady) return;
		if (typeof window === 'undefined') return;

		const snapshot: SelectionSnapshotV1 = {
			version: 1,
			selectedCohorts,
			selectedExpanded,
			selectedOpen,
			activeCohortId
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
		<CohortsHeaderAny {tab} onSwitchTab={switchTab} />

		{#if selectedCohorts.length > 0 && tab !== 'create'}
			<SelectedCohortsPanelAny
				disabled={loading || creating || saving || deleting}
				{selectedCohorts}
				{selectedExpanded}
				{selectedOpen}
				{activeCohortId}
				{activeCohort}
				{membersByCohort}
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
			<CreateCohortPanelAny
				disabled={loading || saving || deleting}
				{creating}
				error={createError}
				created={createdCohort}
				onCreate={createCohort}
			/>
		{/if}

		{#if tab === 'update'}
			<UpdateCohortPanelAny
				disabled={loading || creating || deleting}
				{saving}
				error={updateError}
				success={updateSuccess}
				initialCohortId={activeCohortId ?? ''}
				onUpdate={updateCohort}
			/>
		{/if}

		{#if tab === 'delete'}
			<div class="flex items-center justify-end gap-3">
				<button
					type="button"
					onclick={deleteAllSelected}
					disabled={loading || creating || saving || deleting || selectedCohorts.length === 0}
					class="rounded-sm bg-admin-danger-bg px-3 py-2 text-xs font-medium text-white hover:bg-admin-danger-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if deleting}
						<LoadingDots />
					{:else}
						Delete all selected ({selectedCohorts.length})
					{/if}
				</button>
			</div>

			<DeleteCohortPanelAny
				disabled={loading || creating || saving}
				{deleting}
				error={deleteError}
				initialCohortId={activeCohortId ?? ''}
				onDelete={deleteCohort}
			/>
		{/if}

		{#if tab === 'all'}
			<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
				<div
					class="flex items-center justify-between gap-2.5 border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
				>
					<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
						All cohorts
					</h3>

					<div class="flex items-center gap-3">
						<label for="cohorts_all_pagesize" class="text-xs text-admin-text-muted">Page size</label
						>
						<select
							id="cohorts_all_pagesize"
							bind:value={allPageSize}
							class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-2 py-1 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover"
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
							class="ml-3 rounded-sm bg-admin-accent-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
						>
							Load
						</button>

						<div class="ml-4 flex items-center gap-2">
							<button
								type="button"
								onclick={allPrev}
								disabled={loading || !allLoadedOnce || !allResult.prevCursor}
								class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Prev
							</button>

							<div class="text-xs text-admin-text-muted">
								Page {allResult.currPage} / {totalPages(allResult.totalItems, allResult.pageSize)}
							</div>

							<button
								type="button"
								onclick={allNext}
								disabled={loading || !allLoadedOnce || !allResult.nextCursor}
								class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Next
							</button>
						</div>
					</div>
				</div>

				<div class="p-4">
					{#if error}
						<div class="mb-3 text-sm text-admin-danger-text">{error}</div>
					{/if}

					{#if loading}
						<div class="text-sm text-admin-text-muted"><LoadingDots /></div>
					{:else if !allLoadedOnce}
						<div class="text-sm text-admin-text-muted">Click Load to fetch cohorts.</div>
					{:else if allResult.items.length === 0}
						<div class="text-sm text-admin-text-muted">No cohorts.</div>
					{:else}
						<CohortsTableAny
							cohorts={allResult.items}
							{expanded}
							{membersByCohort}
							onToggle={toggleExpanded}
							onReloadMembers={loadMembers}
							{rowDetailsId}
							{selectedCohortIds}
							disabled={loading || creating || saving || deleting}
							showSelectAll={true}
							onToggleSelect={toggleSelect}
						/>
					{/if}
				</div>
			</div>
		{:else if tab === 'search'}
			<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
				<div
					class="flex items-center justify-between gap-2.5 border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
				>
					<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
						Search cohorts
					</h3>

					<div class="flex items-center gap-3">
						<label for="cohorts_search_pagesize" class="text-xs text-admin-text-muted"
							>Page size</label
						>
						<select
							id="cohorts_search_pagesize"
							bind:value={searchPageSize}
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
						<label for="cohorts_search_query" class="text-xs text-admin-text-muted">Query</label>
						<input
							id="cohorts_search_query"
							bind:value={searchQuery}
							class="w-full rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover"
							placeholder="Type part of cohort name or it's GUID"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									searchPage = 1;
									runSearch();
								}
							}}
						/>
					</div>

					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => {
								searchPage = 1;
								runSearch();
							}}
							disabled={loading || !searchQuery.trim()}
							class="rounded-sm bg-admin-accent-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
						>
							Search
						</button>

						<div class="ml-auto flex items-center gap-2">
							<button
								type="button"
								onclick={searchPrev}
								disabled={loading || !searchedOnce || !searchResult.name.prevCursor}
								class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Prev
							</button>

							<div class="text-xs text-admin-text-muted">
								Page {searchResult.name.currPage} / {totalPages(
									searchResult.name.totalItems,
									searchResult.name.pageSize
								)}
							</div>

							<button
								type="button"
								onclick={searchNext}
								disabled={loading || !searchedOnce || !searchResult.name.nextCursor}
								class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
							>
								Next
							</button>
						</div>
					</div>

					{#if error}
						<div class="text-sm text-admin-danger-text">{error}</div>
					{/if}

					{#if loading}
						<div class="text-sm text-admin-text-muted"><LoadingDots /></div>
					{:else if searchedOnce}
						{#if searchResult.idMatch}
							{@const sel = isSelected(searchResult.idMatch.cohortId)}
							<div
								class={`rounded border px-4 py-3 ${sel ? 'border-admin-accent-primary bg-admin-accent-primary' : 'border-admin-border-primary bg-admin-bg-primary'}`}
							>
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-[240px] flex-1">
										<div class="text-xs tracking-wider text-admin-text-muted uppercase">
											ID match
										</div>
										<div class="mt-2 flex flex-col gap-1">
											<div class="text-xs break-all text-admin-text-muted">
												{@html highlight(searchResult.idMatch.cohortId, searchQuery)}
											</div>
											<div class="text-sm text-admin-text-primary">
												{@html highlight(searchResult.idMatch.name, searchQuery)}
											</div>
											<div class="text-xs text-admin-text-muted">
												Active: {searchResult.idMatch.isActive ? 'yes' : 'no'}
											</div>
											<div class="text-xs text-admin-text-muted">
												Created at: {searchResult.idMatch.createdAt ?? '-'}
											</div>
											<div class="text-xs text-admin-text-muted">
												Created by: {searchResult.idMatch.createdByDisplay}
											</div>
										</div>
									</div>

									<div class="flex items-center gap-2">
										<button
											type="button"
											onclick={() => toggleExpanded(searchResult.idMatch!.cohortId)}
											aria-expanded={expanded[searchResult.idMatch.cohortId] ? 'true' : 'false'}
											aria-controls={rowDetailsId(searchResult.idMatch.cohortId)}
											class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover"
										>
											{expanded[searchResult.idMatch.cohortId] ? 'Hide members' : 'Show members'}
										</button>

										<button
											type="button"
											onclick={() => toggleSelectMaybe(searchResult.idMatch)}
											disabled={loading || creating || saving || deleting}
											class={sel
												? 'rounded-sm bg-admin-accent-selection px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-accent-selection disabled:cursor-not-allowed disabled:opacity-50'
												: 'rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50'}
										>
											{sel ? 'Selected' : 'Select'}
										</button>
									</div>
								</div>

								{#if expanded[searchResult.idMatch.cohortId]}
									<div
										id={rowDetailsId(searchResult.idMatch.cohortId)}
										class="mt-3 rounded border border-admin-border-primary bg-admin-bg-secondary px-3 py-3"
									>
										<CohortMembersPanel
											cohort={searchResult.idMatch}
											state={membersByCohort[searchResult.idMatch.cohortId] ??
												defaultMembersState()}
											onReload={loadMembers}
										/>
									</div>
								{/if}
							</div>
						{/if}

						<div class="overflow-hidden rounded border border-admin-border-primary">
							<div
								class="flex items-center justify-between gap-3 border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
							>
								<div class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
									Name matches
								</div>
								<div class="text-xs text-admin-text-muted">
									Total: {searchResult.name.totalItems}
								</div>
							</div>

							<div class="p-4">
								{#if searchResult.name.totalItems === 0}
									<div class="text-sm text-admin-text-muted">No results.</div>
								{:else}
									<CohortsTableAny
										cohorts={searchResult.name.items}
										{expanded}
										{membersByCohort}
										onToggle={toggleExpanded}
										onReloadMembers={loadMembers}
										{rowDetailsId}
										highlightQuery={searchQuery}
										{selectedCohortIds}
										disabled={loading || creating || saving || deleting}
										showSelectAll={true}
										onToggleSelect={toggleSelect}
									/>
								{/if}
							</div>
						</div>

						{#if !searchResult.idMatch && searchResult.name.totalItems === 0}
							<div class="text-sm text-admin-text-muted">No results.</div>
						{/if}
					{:else}
						<div class="text-sm text-admin-text-muted"></div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</main>
