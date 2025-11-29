<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { DuckDto } from '../../Shop/Dtos';
	import PixelFrameSimple from '$lib/Components/PixelFrames/PixelFrameSimple.svelte';

	let { data }: { data: { ducks: DuckDto[] } } = $props();

	const ducks: DuckDto[] = data.ducks;

	let cohortName = $state('');

	const pickTwoRandom = (list: DuckDto[]): [DuckDto, DuckDto] => {
		const shuffled = [...list].sort(() => Math.random() - 0.5);
		return [shuffled[0], shuffled[1]];
	};

	let [leftDuck, rightDuck] = pickTwoRandom(ducks);

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
		class="ocr-outline ocr-title isolate mt-0 mb-35 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
	>
		Join a Cohort
	</h1>
	<PixelFrameSimple
		className="relative bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] z-10 mb-8 w-full rounded-3xl border border-white/10 p-10 py-12 text-left text-[var(--color-input-text)] backdrop-blur-3xl"
	>
		<div class="absolute -top-[9.3rem] left-35 z-10 -translate-x-1/2">
			<div class="-gap-3 flex items-center">
				<div class="relative left-4 translate-y-[-18px]">
					<div
						class="right-10 w-[10rem] overflow-auto rounded-3xl border-2 border-black bg-white/100 px-5 py-2 text-sm font-semibold text-black shadow-lg"
					>
						<p class="leading-snug">Quack, quack...</p>
					</div>
					<div
						class="absolute top-1/2 -right-1 h-3 w-3 -translate-y-1/3 rotate-45 border-t-2 border-r-2 border-black bg-white/100"
					></div>
				</div>

				<CloudfrontImage
					path={`Ducks/Outfits/duck-${leftDuck.id}.png`}
					cls="h-30 w-31 -scale-x-100 drop-shadow-md"
				/>
				<CloudfrontImage
					path={`Ducks/Outfits/duck-${rightDuck.id}.png`}
					cls="h-30 w-31 drop-shadow-md"
				/>

				<div class="relative right-4 translate-y-[-4px]">
					<div
						class="w-[6rem] overflow-auto rounded-3xl border-2 border-black bg-white/100 px-5 py-2 text-sm font-semibold text-black shadow-lg"
					>
						<p class="leading-snug">Agree!</p>
					</div>
					<div
						class="absolute top-1/2 -left-1 h-3 w-3 -translate-y-1/3 -rotate-45 border-t-2 border-l-2 border-black bg-white/100"
					></div>
				</div>
			</div>
		</div>

		<h5 class="mt-2 mb-8 text-base text-[color:var(--color-text)]">
			You can either create your own or ask a friend for an invite link
		</h5>

		<input
			bind:value={cohortName}
			placeholder="type a name for a new cohort"
			class="mb-10 w-full rounded border bg-white px-4 py-2 text-black"
			onkeydown={(e) => {
				if (e.key === 'Enter') createCohort();
			}}
		/>
	</PixelFrameSimple>

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
