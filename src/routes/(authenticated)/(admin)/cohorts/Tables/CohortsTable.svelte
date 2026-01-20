<script lang="ts">
	import CohortMembersPanel from '../Panels/CohortMembersPanel.svelte';

	type CohortRow = {
		cohortId: string;
		name: string;
		isActive: boolean;
		createdAt: string | null;
		createdByUserId: string | null;
		createdByDisplay: string;
	};

	type CohortMemberRow = {
		userId: string;
		userName: string;
		email: string;
		joinedAt?: string | null;
	};

	type CohortMembersState = {
		loaded: boolean;
		loading: boolean;
		error: string | null;
		totalMembers: number;
		members: CohortMemberRow[];
	};

	type Props = {
		cohorts?: CohortRow[];
		expanded?: Record<string, boolean>;
		membersByCohort?: Record<string, CohortMembersState>;
		onToggle?: (cohortId: string) => void | Promise<void>;
		onReloadMembers?: (cohortId: string) => void | Promise<void>;
		rowDetailsId?: (cohortId: string) => string;

		highlightQuery?: string;

		selectedCohortIds?: string[];
		disabled?: boolean;
		showSelectAll?: boolean;
		onToggleSelect?: (c: CohortRow) => void;
	};

	let {
		cohorts = [],
		expanded = {},
		membersByCohort = {},
		onToggle = () => {},
		onReloadMembers = () => {},
		rowDetailsId = () => '',

		highlightQuery = '',

		selectedCohortIds = [],
		disabled = false,
		showSelectAll = false,
		onToggleSelect = () => {}
	} = $props() as Props;

	const normId = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();

	const isSelected = (id: string) =>
		(selectedCohortIds ?? []).some((x) => normId(x) === normId(id));

	const allVisibleSelected = $derived(
		(cohorts ?? []).length > 0 && (cohorts ?? []).every((c) => isSelected(c.cohortId))
	);

	const toggleAllVisible = () => {
		const rows = cohorts ?? [];
		if (rows.length === 0) return;

		if (allVisibleSelected) {
			for (const c of rows) {
				if (isSelected(c.cohortId)) onToggleSelect(c);
			}
			return;
		}

		for (const c of rows) {
			if (!isSelected(c.cohortId)) onToggleSelect(c);
		}
	};

	const defaultMembersState = (): CohortMembersState => ({
		loaded: false,
		loading: false,
		error: null,
		totalMembers: 0,
		members: []
	});

	const formatDateTime = (iso: string | null) => {
		if (!iso) return '-';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleString();
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

	const isSearchMode = $derived(Boolean((highlightQuery ?? '').trim()));

	const rowClass = (sel: boolean) => {
		if (!sel) return 'text-admin-text-secondary';
		return isSearchMode
			? 'bg-admin-accent-primary text-white'
			: 'bg-admin-accent-selection text-admin-text-primary';
	};

	const selectedButtonClass = () =>
		isSearchMode
			? 'rounded-sm bg-admin-accent-selection px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-accent-selection disabled:cursor-not-allowed disabled:opacity-50'
			: 'rounded-sm bg-admin-accent-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50';

	const unselectedButtonClass =
		'rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="overflow-x-auto">
	<table class="w-full border-collapse text-sm">
		<thead>
			<tr class="text-left text-admin-text-primary">
				<th class="border-b border-admin-border-primary py-2 pr-4">Cohort ID</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Name</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Active</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Created at</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Created by</th>
				<th class="border-b border-admin-border-primary py-2 pr-4">Details</th>
				<th class="border-b border-admin-border-primary py-2 pr-0 text-right">
					{#if showSelectAll}
						<button
							type="button"
							onclick={toggleAllVisible}
							disabled={disabled || (cohorts?.length ?? 0) === 0}
							class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-semibold tracking-wider text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
						>
							{allVisibleSelected ? 'UNSELECT ALL' : 'SELECT ALL'}
						</button>
					{/if}
				</th>
			</tr>
		</thead>

		<tbody>
			{#each cohorts as c (c.cohortId)}
				{@const sel = isSelected(c.cohortId)}
				<tr class={rowClass(sel)}>
					<td class="border-b border-admin-border-primary py-2 pr-4 font-mono text-xs">
						{#if isSearchMode}
							{@html highlight(c.cohortId, highlightQuery)}
						{:else}
							{c.cohortId}
						{/if}
					</td>

					<td class="border-b border-admin-border-primary py-2 pr-4">
						{#if isSearchMode}
							<span class="text-admin-text-primary">{@html highlight(c.name, highlightQuery)}</span>
						{:else}
							{c.name}
						{/if}
					</td>

					<td class="border-b border-admin-border-primary py-2 pr-4">{c.isActive ? 'yes' : 'no'}</td
					>
					<td class="border-b border-admin-border-primary py-2 pr-4"
						>{formatDateTime(c.createdAt)}</td
					>
					<td
						class="border-b border-admin-border-primary py-2 pr-4"
						title={c.createdByUserId ?? ''}
					>
						{c.createdByDisplay}
					</td>

					<td class="border-b border-admin-border-primary py-2 pr-4">
						<button
							type="button"
							onclick={() => onToggle(c.cohortId)}
							aria-expanded={expanded[c.cohortId] ? 'true' : 'false'}
							aria-controls={rowDetailsId(c.cohortId)}
							class="rounded-sm bg-admin-bg-input px-3 py-1.5 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover"
						>
							{expanded[c.cohortId] ? 'Hide' : 'Show'}
						</button>
					</td>

					<td class="border-b border-admin-border-primary py-2 pr-0 text-right">
						<button
							type="button"
							onclick={() => onToggleSelect(c)}
							{disabled}
							class={sel ? selectedButtonClass() : unselectedButtonClass}
						>
							{sel ? 'Selected' : 'Select'}
						</button>
					</td>
				</tr>

				{#if expanded[c.cohortId]}
					<tr id={rowDetailsId(c.cohortId)} class="text-admin-text-secondary">
						<td
							colspan="7"
							class="border-b border-admin-border-primary bg-admin-bg-primary px-3 py-3"
						>
							<CohortMembersPanel
								cohort={c}
								state={membersByCohort[c.cohortId] ?? defaultMembersState()}
								onReload={onReloadMembers}
							/>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
