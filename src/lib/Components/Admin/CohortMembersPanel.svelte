<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import CohortMembersTable from '$lib/Components/Admin/CohortMembersTable.svelte';

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

	export let cohort: CohortRow;
	export let state: CohortMembersState;
	export let onReload: (cohortId: string) => void;
</script>

<div class="bg-[#1f1f1f]">
	{#if state.error}
		<div class="text-sm text-[#ffb4b4] mb-2">{state.error}</div>
	{/if}

	<div class="flex items-center justify-between gap-3 mb-3">
		<div class="flex flex-col gap-1">
			<div class="text-xs text-[#a8a8a8]">Members count: {state.totalMembers}</div>
		</div>

		<button
			type="button"
			onclick={() => onReload(cohort.cohortId)}
			disabled={state.loading}
			class="px-3 py-1.5 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Reload members
		</button>
	</div>

	{#if state.loading}
		<div class="text-sm text-[#a8a8a8]"><LoadingDots /></div>
	{:else if (state.members?.length ?? 0) === 0}
		<div class="text-sm text-[#a8a8a8]">No members.</div>
	{:else}
		<CohortMembersTable members={state.members} />
	{/if}
</div>
