<script lang="ts">
	import CohortMembersPanel from '../Panels/CohortMembersPanel.svelte';

	type CohortRow = {
		cohortId: string;
		name: string;
		isActive: boolean;
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

	export let cohorts: CohortRow[] = [];
	export let expanded: Record<string, boolean> = {};
	export let membersByCohort: Record<string, CohortMembersState> = {};
	export let onToggle: (cohortId: string) => void;
	export let onReloadMembers: (cohortId: string) => void;
	export let rowDetailsId: (cohortId: string) => string;

	const defaultMembersState = (): CohortMembersState => ({
		loaded: false,
		loading: false,
		error: null,
		totalMembers: 0,
		members: []
	});
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="text-left text-[#e7e7e7]">
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Cohort ID</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Name</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Active</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Created by</th>
				<th class="py-2 pr-0 border-b border-[#3c3c3c]">Details</th>
			</tr>
		</thead>
		<tbody>
			{#each cohorts as c (c.cohortId)}
				<tr class="text-[#cccccc]">
					<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs">{c.cohortId}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{c.name}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{c.isActive ? 'yes' : 'no'}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]" title={c.createdByUserId ?? ''}>{c.createdByDisplay}</td>
					<td class="py-2 pr-0 border-b border-[#2a2a2a]">
						<button
							type="button"
							onclick={() => onToggle(c.cohortId)}
							aria-expanded={expanded[c.cohortId] ? 'true' : 'false'}
							aria-controls={rowDetailsId(c.cohortId)}
							class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a]"
						>
							{expanded[c.cohortId] ? 'Hide' : 'Show'}
						</button>
					</td>
				</tr>

				{#if expanded[c.cohortId]}
					<tr id={rowDetailsId(c.cohortId)} class="text-[#cccccc]">
						<td colspan="5" class="py-3 px-3 border-b border-[#2a2a2a] bg-[#1f1f1f]">
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
