<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	type Props = {
		disabled?: boolean;
		deleting?: boolean;
		error?: string | null;
		initialCohortId?: string;
		onDelete: (cohortId: string) => void;
	};

	let {
		disabled = false,
		deleting = false,
		error = null,
		initialCohortId = '',
		onDelete
	} = $props() as Props;

	let cohortId = $state(initialCohortId);

	$effect(() => {
		cohortId = initialCohortId;
	});

	const canSubmit = () => Boolean(cohortId.trim());

	const submit = () => {
		if (!canSubmit()) return;
		onDelete(cohortId.trim());
	};
</script>

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div class="border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3">
		<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
			Delete cohort
		</h3>
	</div>

	<div class="flex flex-col gap-4 p-4">
		{#if error}
			<div class="text-sm text-admin-danger-text">{error}</div>
		{/if}

		<div class="flex flex-col gap-2">
			<label for="admin_delete_cohort_id" class="text-xs text-admin-text-muted">Cohort ID</label>
			<input
				id="admin_delete_cohort_id"
				type="text"
				bind:value={cohortId}
				disabled={disabled || deleting}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
			/>
		</div>

		<div class="flex items-center justify-end">
			<button
				type="button"
				onclick={submit}
				disabled={disabled || deleting || !canSubmit()}
				class="rounded-sm bg-admin-danger-bg px-3 py-2 text-xs font-medium text-white hover:bg-admin-danger-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if deleting}
					<LoadingDots />
				{:else}
					Delete
				{/if}
			</button>
		</div>
	</div>
</div>
