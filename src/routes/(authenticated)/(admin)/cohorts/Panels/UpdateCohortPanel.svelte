<script lang="ts">
	import CohortUpdateForm from '../Forms/CohortUpdateForm.svelte';

	const CohortUpdateFormAny = CohortUpdateForm as unknown as any;

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
</script>

<CohortUpdateFormAny {disabled} {saving} {error} {success} {initialCohortId} {onUpdate} />
