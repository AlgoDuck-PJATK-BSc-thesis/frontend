<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	type CreatedCohort = {
		cohortId: string;
		name: string;
	};

	type Props = {
		disabled?: boolean;
		creating?: boolean;
		error?: string | null;
		created?: CreatedCohort | null;
		onCreate: (payload: { name: string }) => void;
	};

	let {
		disabled = false,
		creating = false,
		error = null,
		created = null,
		onCreate
	} = $props() as Props;

	let name = $state('');

	const canSubmit = () => Boolean(name.trim());

	const submit = () => {
		if (!canSubmit()) return;
		onCreate({ name: name.trim() });
	};
</script>

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div class="border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3">
		<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
			Create cohort
		</h3>
	</div>

	<div class="flex flex-col gap-4 p-4">
		{#if error}
			<div class="text-sm text-admin-danger-text">{error}</div>
		{/if}

		{#if created}
			<div class="text-sm text-admin-accent-link">
				Created: <span class="font-mono text-xs">{created.cohortId}</span> - {created.name}
			</div>
		{/if}

		<div class="flex flex-col gap-2">
			<label for="admin_create_cohort_name" class="text-xs text-admin-text-muted">Name</label>
			<input
				id="admin_create_cohort_name"
				type="text"
				bind:value={name}
				disabled={disabled || creating}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
			/>
		</div>

		<div class="flex items-center justify-end">
			<button
				type="button"
				onclick={submit}
				disabled={disabled || creating || !canSubmit()}
				class="rounded-sm bg-admin-accent-primary px-3 py-2 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if creating}
					<LoadingDots />
				{:else}
					Create
				{/if}
			</button>
		</div>
	</div>
</div>
