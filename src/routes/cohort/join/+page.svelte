<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import duck from '$lib/images/ducks/duck.png';

	let cohortName = '';

	function createCohort() {
		if (!cohortName.trim()) return;

		localStorage.setItem('userCohort', cohortName.trim());

		goto(`/cohort/${cohortName.trim()}?view=chat`);
	}
</script>


<svelte:head>
	<title>Join a Cohort - AlgoDuck</title>
</svelte:head>


<section class="mx-auto max-w-xl py-12 text-center">
	<h1
		class="mt-8 text-6xl font-black tracking-widest text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
		style="font-family: var(--font-ariw9500);"
	>
		Join a Cohort
	</h1>
	<PixelFrame
		className="relative flex w-full max-w-md flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] ml-14 px-10 pt-5 pb-1 mt-28 mb-10 "
	>
		<div class="absolute -top-[6.5rem] left-1/2 z-10 flex -translate-x-1/2 gap-2">
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
	</PixelFrame>

	<Button
		size="medium"
		label="CREATE"
		labelColor="[color:var(--color-text-button)]"
		labelFontSize="1.15rem"
		labelFontFamily="var(--font-ariw9500)"
		labelFontWeight="normal"
		onclick={createCohort}
	/>
</section>
