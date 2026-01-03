<script lang="ts">
	import { FetchFromApi } from '$lib/api/apiCall';
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import CohortMembersTable from '../Tables/CohortMembersTable.svelte';

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

	let addUserId = '';
	let actionError: string | null = null;
	let adding = false;
	let removingUserId: string | null = null;

	let addInputId = '';
	$: addInputId = `admin_add_member_${cohort.cohortId}`;

	const fetchWithTimeout: typeof fetch = (input, init) => {
		const controller = new AbortController();
		const t = setTimeout(() => controller.abort(), 15000);
		const merged = { ...(init ?? {}), signal: controller.signal };
		return fetch(input, merged).finally(() => clearTimeout(t));
	};

	const addMember = async () => {
		const userId = addUserId.trim();
		if (!userId) return;

		actionError = null;
		adding = true;

		try {
			await FetchFromApi(
				`admin/cohorts/${encodeURIComponent(cohort.cohortId)}/members`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId })
				},
				fetchWithTimeout
			);

			addUserId = '';
			await onReload(cohort.cohortId);
		} catch (e) {
			actionError = e instanceof Error ? e.message : 'Failed to add member.';
		} finally {
			adding = false;
		}
	};

	const removeMember = async (userId: string) => {
		if (!confirm('Remove this user from the cohort?')) return;

		actionError = null;
		removingUserId = userId;

		try {
			await FetchFromApi(
				`admin/cohorts/${encodeURIComponent(cohort.cohortId)}/members/${encodeURIComponent(userId)}`,
				{ method: 'DELETE' },
				fetchWithTimeout
			);

			await onReload(cohort.cohortId);
		} catch (e) {
			actionError = e instanceof Error ? e.message : 'Failed to remove member.';
		} finally {
			removingUserId = null;
		}
	};
</script>

<div class="bg-[#1f1f1f]">
	{#if state.error}
		<div class="text-sm text-[#ffb4b4] mb-2">{state.error}</div>
	{/if}

	{#if actionError}
		<div class="text-sm text-[#ffb4b4] mb-2">{actionError}</div>
	{/if}

	<div class="flex items-center justify-between gap-3 mb-3">
		<div class="flex flex-col gap-1">
			<div class="text-xs text-[#a8a8a8]">Members count: {state.totalMembers}</div>
		</div>

		<button
			type="button"
			onclick={() => onReload(cohort.cohortId)}
			disabled={state.loading || adding || removingUserId !== null}
			class="px-3 py-1.5 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Reload members
		</button>
	</div>

	<div class="flex flex-col gap-2 mb-4">
		<label for={addInputId} class="text-xs text-[#a8a8a8]">Add member by User ID</label>
		<div class="flex items-center gap-2">
			<input
				id={addInputId}
				bind:value={addUserId}
				class="flex-1 bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4]"
				placeholder="GUID"
				disabled={adding || removingUserId !== null}
				onkeydown={(e) => {
					if (e.key === 'Enter') addMember();
				}}
			/>
			<button
				type="button"
				onclick={addMember}
				disabled={!addUserId.trim() || adding || removingUserId !== null}
				class="px-3 py-2 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if adding}
					<LoadingDots />
				{:else}
					Add
				{/if}
			</button>
		</div>
	</div>

	{#if state.loading}
		<div class="text-sm text-[#a8a8a8]"><LoadingDots /></div>
	{:else if (state.members?.length ?? 0) === 0}
		<div class="text-sm text-[#a8a8a8]">No members.</div>
	{:else}
		<CohortMembersTable
			members={state.members}
			onRemove={removeMember}
			removingUserId={removingUserId}
			disabled={adding || removingUserId !== null}
		/>
	{/if}
</div>
