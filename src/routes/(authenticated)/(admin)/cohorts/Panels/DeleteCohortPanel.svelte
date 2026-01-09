<script lang="ts">
	import CohortDeleteForm from '../Forms/CohortDeleteForm.svelte';

	const CohortDeleteFormAny = CohortDeleteForm as unknown as any;

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
</script>

<CohortDeleteFormAny {disabled} {deleting} {error} {initialCohortId} {onDelete} />
