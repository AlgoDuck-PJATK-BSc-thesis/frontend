<script>
	import Button from '../../Components/ButtonComponents/Button.svelte';
	import PixelFrame from '../../Components/LayoutComponents/PixelFrames/PixelFrame.svelte';

	let cohortName = '';
</script>

<section class="mx-auto max-w-md py-16 text-center">
	<h1
		class="mb-10 text-6xl font-bold text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);"
	>
		Join a Cohort
	</h1>
	<PixelFrame
		className="flex w-full max-w-2xl flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] px-10 pt-8 pb-12"
	>
		<h1 class="mb-3 mt-4  text-2xl font-bold tracking-normal text-[color:var(--color-accent-2)]">How to do it?</h1>
		<h5 class="mb-8 text-base text-[color:var(--color-text)]">
			You can either create your own or ask a friend for an invite link
		</h5>

		<input
			bind:value={cohortName}
			placeholder="type a name for a new cohort"
			class="mb-10 w-full rounded border bg-white px-4 py-2 text-black"
		/>

		<Button
			size="medium"
			label="Create"
			labelColor="[color:var(--color-text-button)]"
			labelFontSize="1.15rem"
			labelFontFamily="var(--font-ariw9500)"
			labelFontWeight="normal"
			onclick={() => alert(`Creating cohort: ${cohortName}`)}
		/>
	</PixelFrame>
</section>
