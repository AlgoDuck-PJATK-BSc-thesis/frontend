<script lang="ts">
	import CohortCreateForm from '../Forms/CohortCreateForm.svelte';

	const CohortCreateFormAny = CohortCreateForm as unknown as any;

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
</script>

<CohortCreateFormAny {disabled} {creating} {error} {created} {onCreate} />
