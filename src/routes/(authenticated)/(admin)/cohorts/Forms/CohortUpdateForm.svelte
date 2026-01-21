<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	type UpdateSuccess = {
		cohortId: string;
		name: string;
	};

	type Props = {
		disabled?: boolean;
		saving?: boolean;
		error?: string | null;
		success?: UpdateSuccess | null;
		initialCohortId?: string;
		onUpdate: (payload: { cohortId: string; name: string }) => void;
	};

	let {
		disabled = false,
		saving = false,
		error = null,
		success = null,
		initialCohortId = '',
		onUpdate
	} = $props() as Props;

	let cohortId = $state(initialCohortId);
	let name = $state('');

	$effect(() => {
		cohortId = initialCohortId;
	});

	const canSubmit = () => Boolean(cohortId.trim() && name.trim());

	const submit = () => {
		if (!canSubmit()) return;
		onUpdate({ cohortId: cohortId.trim(), name: name.trim() });
	};
</script>

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div class="border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3">
		<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
			Update cohort
		</h3>
	</div>

	<div class="flex flex-col gap-4 p-4">
		{#if error}
			<div class="text-sm text-admin-danger-text">{error}</div>
		{/if}

		{#if success}
			<div class="text-sm text-admin-accent-link">
				Saved: <span class="text-xs">{success.cohortId}</span> - {success.name}
			</div>
		{/if}

		<div class="flex flex-col gap-2">
			<label for="admin_update_cohort_id" class="text-xs text-admin-text-muted">Cohort ID</label>
			<input
				id="admin_update_cohort_id"
				type="text"
				bind:value={cohortId}
				disabled={disabled || saving}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
			/>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_cohort_name" class="text-xs text-admin-text-muted">New name</label>
			<input
				id="admin_update_cohort_name"
				type="text"
				bind:value={name}
				disabled={disabled || saving}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
			/>
		</div>

		<div class="flex items-center justify-end">
			<button
				type="button"
				onclick={submit}
				disabled={disabled || saving || !canSubmit()}
				class="rounded-sm bg-admin-accent-primary px-3 py-2 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if saving}
					<LoadingDots />
				{:else}
					Update
				{/if}
			</button>
		</div>
	</div>
</div>
