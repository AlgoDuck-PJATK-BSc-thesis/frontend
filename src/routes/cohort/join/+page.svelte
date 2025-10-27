<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import CloudfrontImage from '$lib/Components/CloudfrontImage.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';

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
		class="isolate mt-8 [font-family:var(--font-ariw9500)] text-6xl
       font-black tracking-widest text-[var(--color-primary)]
       shadow-none drop-shadow-none filter-none backdrop-filter-none
       [--dx:6px] [--dy:4px] [--stroke:5px]
       [-webkit-text-stroke-color:var(--shadow-header)]
       [-webkit-text-stroke-width:var(--stroke)]
       [paint-order:stroke_fill]
       [text-shadow:var(--dx)_var(--dy)_0_var(--shadow-header)]
       supports-[not(-webkit-text-stroke:1px_black)]:[text-shadow:var(--dx)_var(--dy)_0_var(--shadow-header),0_1px_0_var(--shadow-header),0_-1px_0_var(--shadow-header),1px_0_0_var(--shadow-header),-1px_0_0_var(--shadow-header),1px_1px_0_var(--shadow-header),1px_-1px_0_var(--shadow-header),-1px_1px_0_var(--shadow-header),-1px_-1px_0_var(--shadow-header),0_2px_0_var(--shadow-header),0_-2px_0_var(--shadow-header),2px_0_0_var(--shadow-header),-2px_0_0_var(--shadow-header),2px_2px_0_var(--shadow-header),2px_-2px_0_var(--shadow-header),-2px_2px_0_var(--shadow-header),-2px_-2px_0_var(--shadow-header)]"
	>
		Join a Cohort
	</h1>
	<PixelFrame
		className="relative flex w-full max-w-md flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] ml-14 px-10 pt-5 pb-1 mt-28 mb-10 "
	>
		<div class="absolute -top-[7rem] left-[45%] z-10 flex -translate-x-1/2 gap-2">
			<CloudfrontImage path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`} cls="h-30 w-31 -scale-x-100 drop-shadow-md"/>
			<CloudfrontImage path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`} cls="h-30 w-31 drop-shadow-md"/>
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
		size="big"
		label="CREATE"
		labelColor="[color:var(--color-text-button)]"
		labelFontSize="1.2rem"
		labelFontFamily="var(--font-lexenddeca)"
		labelFontWeight="bold"
		onclick={createCohort}
	/>
</section>
