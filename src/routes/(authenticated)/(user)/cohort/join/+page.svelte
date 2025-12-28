<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { DuckDto } from '../../Shop/Dtos';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onMount } from 'svelte';
	import { cohortApi } from '$lib/api/cohort';

	let { data }: { data: { ducks: DuckDto[] } } = $props();

	const ducks: DuckDto[] = data.ducks;

	let cohortName = $state('');
	let joinCode = $state('');

	const pickTwoRandom = (list: DuckDto[]): [DuckDto, DuckDto] => {
		const shuffled = [...list].sort(() => Math.random() - 0.5);
		return [shuffled[0], shuffled[1]];
	};

	let [leftDuck, rightDuck] = pickTwoRandom(ducks);

	onMount(async () => {
		const current = await cohortApi.getCurrent().catch(() => null);
		if (current) goto(`/cohort/${current.cohortId}/chat`);
	});

	const handleAlreadyInCohort = async (attempt: () => Promise<any>) => {
		const ok = confirm('You are already in a cohort. Leave your current cohort and continue?');
		if (!ok) return null;
		await cohortApi.leave();
		return await attempt();
	};

	async function createFromName() {
		const name = cohortName.trim();
		if (!name) return;

		const attempt = async () => await cohortApi.create({ name });

		try {
			const res = await attempt();
			goto(`/cohort/${res.cohortId}/chat`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to create cohort.';
			if (typeof msg === 'string' && msg.toLowerCase().includes('already belongs to a cohort')) {
				try {
					const res2 = await handleAlreadyInCohort(attempt);
					if (!res2) return;
					goto(`/cohort/${res2.cohortId}/chat`);
					return;
				} catch (err2) {
					const msg2 = err2 instanceof Error ? err2.message : 'Failed to switch cohorts.';
					alert(msg2);
					return;
				}
			}
			alert(msg);
		}
	}

	async function joinFromCode() {
		const code = joinCode.trim();
		if (!code) return;

		const attempt = async () => await cohortApi.joinByCode({ code });

		try {
			const res = await attempt();
			goto(`/cohort/${res.cohortId}/chat`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to join cohort.';
			if (typeof msg === 'string' && msg.toLowerCase().includes('already belongs to a cohort')) {
				try {
					const res2 = await handleAlreadyInCohort(attempt);
					if (!res2) return;
					goto(`/cohort/${res2.cohortId}/chat`);
					return;
				} catch (err2) {
					const msg2 = err2 instanceof Error ? err2.message : 'Failed to switch cohorts.';
					alert(msg2);
					return;
				}
			}
			alert(msg);
		}
	}

	async function submit() {
		if (joinCode.trim()) return await joinFromCode();
		return await createFromName();
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
		className="relative bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] z-10 mb-8 w-full rounded-3xl border-xl border-white/10 p-10 py-12 text-left text-[var(--color-input-text)] backdrop-blur-3xl"
	>
		<div class="absolute -top-[8.8rem] left-35 z-10 -translate-x-1/2">
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

		<h5 class="mb-4 text-base text-[color:var(--color-landingpage-subtitle)]">
			You can either create your own cohort:
		</h5>

		<input
			bind:value={cohortName}
			placeholder="type a name for your cohort"
			class="mb-10 w-full rounded border bg-white px-4 py-2 text-black"
			onkeydown={(e) => {
				if (e.key === 'Enter') createFromName();
			}}
		/>
		<h5 class="mb-4 text-base text-[color:var(--color-landingpage-subtitle)]">
			Or ask a friend for a code to join their cohort:
		</h5>

		<input
			bind:value={joinCode}
			placeholder="type a code to join your friend's cohort"
			class="mb-6 w-full rounded border bg-white px-4 py-2 text-black"
			onkeydown={(e) => {
				if (e.key === 'Enter') joinFromCode();
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
		onclick={submit}
	/>
</section>
