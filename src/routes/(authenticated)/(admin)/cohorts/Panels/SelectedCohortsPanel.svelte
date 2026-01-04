<script lang="ts">
	type CohortRow = {
		cohortId: string;
		name: string;
		isActive: boolean;
		createdAt: string | null;
		createdByUserId: string | null;
		createdByDisplay: string;
	};

	type CohortMembersState = {
		loaded: boolean;
		loading: boolean;
		error: string | null;
		totalMembers: number;
		members: any[];
	};

	type Props = {
		disabled?: boolean;

		selectedCohorts: CohortRow[];
		selectedExpanded: Record<string, boolean>;
		selectedOpen: boolean;

		activeCohortId: string | null;
		activeCohort: CohortRow | null;

		membersByCohort?: Record<string, CohortMembersState>;

		onToggleOpen: () => void;
		onExpandAll: () => void;
		onCollapseAll: () => void;
		onClearAll: () => void;

		onSetActive: (cohortId: string) => void;
		onToggleDetails: (cohortId: string) => void;
		onRemove: (cohortId: string) => void;
	};

	let {
		disabled = false,

		selectedCohorts,
		selectedExpanded,
		selectedOpen,

		activeCohortId,
		activeCohort,

		membersByCohort = {},

		onToggleOpen,
		onExpandAll,
		onCollapseAll,
		onClearAll,

		onSetActive,
		onToggleDetails,
		onRemove
	} = $props() as Props;

	const allExpanded = $derived(
		(selectedCohorts ?? []).length > 0 &&
			(selectedCohorts ?? []).every((c) => Boolean(selectedExpanded?.[c.cohortId]))
	);

	const toggleExpandCollapseAll = () => {
		if (allExpanded) onCollapseAll();
		else onExpandAll();
	};

	const formatDateTime = (iso: string | null) => {
		if (!iso) return '—';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleString();
	};

	const membersText = (cohortId: string) => {
		const st = membersByCohort?.[cohortId];
		if (!st) return '—';
		if (st.loading) return 'loading…';
		if (!st.loaded) return '—';
		return String(st.totalMembers ?? 0);
	};
</script>

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div
		class="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
	>
		<div class="flex items-center gap-3">
			<div class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
				Selected cohorts
			</div>
			<div class="text-xs text-admin-text-muted">({selectedCohorts.length})</div>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onclick={onToggleOpen}
				{disabled}
				aria-label={selectedOpen
					? 'Collapse selected cohorts section'
					: 'Expand selected cohorts section'}
				class="flex h-9 w-9 items-center justify-center rounded-sm bg-admin-bg-input text-lg font-semibold text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				{selectedOpen ? '▴' : '▾'}
			</button>

			<button
				type="button"
				onclick={toggleExpandCollapseAll}
				disabled={disabled || selectedCohorts.length === 0}
				class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				{allExpanded ? 'Collapse all' : 'Expand all'}
			</button>

			<button
				type="button"
				onclick={onClearAll}
				disabled={disabled || selectedCohorts.length === 0}
				class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				Clear all
			</button>
		</div>
	</div>

	{#if selectedOpen}
		<div class="flex flex-col gap-3 p-4">
			{#if selectedCohorts.length === 0}
				<div class="text-sm text-admin-text-muted">No selected cohorts.</div>
			{:else}
				{#each selectedCohorts as c (c.cohortId)}
					<div
						class={`overflow-hidden rounded-sm border ${c.cohortId === activeCohortId ? 'border-admin-accent-primary bg-admin-accent-selection' : 'border-admin-border-primary bg-admin-bg-primary'}`}
						role="button"
						tabindex="0"
						onclick={() => onSetActive(c.cohortId)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') onSetActive(c.cohortId);
						}}
					>
						<div class="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
							<div class="flex min-w-[240px] flex-1 flex-col gap-1">
								<div class="font-mono text-sm break-all text-admin-text-primary">{c.cohortId}</div>

								{#if selectedExpanded[c.cohortId]}
									<div class="flex flex-col gap-1 pt-2">
										<div class="text-xs text-admin-text-muted">
											Name: <span class="text-admin-text-primary">{c.name}</span>
										</div>
										<div class="text-xs text-admin-text-muted">
											Active: <span class="text-admin-text-primary"
												>{c.isActive ? 'yes' : 'no'}</span
											>
										</div>
										<div class="text-xs text-admin-text-muted">
											Created at: <span class="text-admin-text-primary"
												>{formatDateTime(c.createdAt)}</span
											>
										</div>
										<div class="text-xs text-admin-text-muted">
											Members: <span class="text-admin-text-primary">{membersText(c.cohortId)}</span
											>
										</div>
										<div class="text-xs text-admin-text-muted">
											Created by: <span class="text-admin-text-primary">{c.createdByDisplay}</span>
										</div>
									</div>
								{:else}
									<div class="truncate text-xs text-admin-text-muted">{c.name}</div>
								{/if}
							</div>

							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										onToggleDetails(c.cohortId);
									}}
									{disabled}
									class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
								>
									{selectedExpanded[c.cohortId] ? 'Hide details' : 'Show details'}
								</button>

								<button
									type="button"
									onclick={(e) => {
										e.stopPropagation();
										onRemove(c.cohortId);
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
			{#if activeCohort}
				<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
					<div class="font-mono text-sm break-all text-admin-text-muted">
						{activeCohort.cohortId}
					</div>
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-admin-text-muted">
						<span>{activeCohort.name}</span>
						<span>active: {activeCohort.isActive ? 'yes' : 'no'}</span>
						<span class="mx-1 text-admin-border-primary">|</span>
						<span>(expand to see all selected cohorts)</span>
					</div>
				</div>
			{:else}
				<div class="text-sm text-admin-text-muted">No active cohort.</div>
			{/if}
		</div>
	{/if}
</div>
