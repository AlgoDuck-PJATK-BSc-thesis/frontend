<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

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
		class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ocra)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
	>
		Join a Cohort
	</h1>
	<PixelFrame
		className="relative flex w-full max-w-md flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] ml-14 px-10 pt-5 pb-1 mt-28 mb-10 "
	>
		<div class="absolute -top-[7rem] left-[45%] z-10 flex -translate-x-1/2 gap-2">
			<CloudfrontImage
				path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
				cls="h-30 w-31 -scale-x-100 drop-shadow-md"
			/>
			<CloudfrontImage
				path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
				cls="h-30 w-31 drop-shadow-md"
			/>
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
		label="→"
		labelFontFamily="var(--font-ariw9500)"
		labelColor="rgba(0,0,0,0.7)"
		labelFontSize="2rem"
		labelFontWeight="normal"
		labelTracking="extra"
		labelClass=""
		onclick={createCohort}
	/>
</section>