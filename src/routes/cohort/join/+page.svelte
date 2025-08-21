<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '../../../Components/ButtonComponents/Button.svelte';
	import PixelFrame from '../../../Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import duck from '$lib/images/ducks/duck.png';

	let cohortName = '';

	function createCohort() {
		if (!cohortName.trim()) return;

		localStorage.setItem('userCohort', cohortName.trim());

		goto(`/cohort/${cohortName.trim()}?view=chat`);
	}
</script>

<section class="mx-auto max-w-md py-16 text-center">
	<h1
		class="mb-10 text-6xl font-bold text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);"
	>
		Join a Cohort
	</h1>
	<PixelFrame
		className="relative flex w-full max-w-2xl flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] px-10 pt-8 pb-12 mt-26"
	>
		<div class="absolute -top-[7.3rem] left-1/2 z-10 flex -translate-x-1/2 gap-4">
			<img src={duck} alt="duck" class="h-24 w-25 -scale-x-100 drop-shadow-md" />
			<img src={duck} alt="duck" class="h-24 w-25 drop-shadow-md" />
		</div>

		<h5 class="mt-2 mb-8 text-base text-[color:var(--color-text)]">
			You can either create your own or ask a friend for an invite link
		</h5>

		<input
			bind:value={cohortName}
			placeholder="type a name for a new cohort"
			class="mb-10 w-full rounded border bg-white px-4 py-2 text-black"
			on:keydown={(e) => {
				if (e.key === 'Enter') createCohort();
			}}
		/>

		<Button
			size="medium"
			label="Create"
			labelColor="[color:var(--color-text-button)]"
			labelFontSize="1.15rem"
			labelFontFamily="var(--font-ariw9500)"
			labelFontWeight="normal"
			onclick={createCohort}
		/>
	</PixelFrame>
</section>
