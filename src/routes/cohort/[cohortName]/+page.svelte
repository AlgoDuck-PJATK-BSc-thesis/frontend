<script lang="ts">
	import Chat from './chat.svelte';
	import Leaderboard from './leaderboard.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PixelFrame from '../../../Components/LayoutComponents/PixelFrames/PixelFrame.svelte';

	let view = '';
	let cohortName = '';
	let showOptions = false;

	const allUsers = [
		{ name: 'FrostedFalcon', points: 15000 },
		{ name: 'EchoOrbit', points: 100 },
		{ name: 'PixelPenguin', points: 9000 },
		{ name: 'NovaNebula', points: 80 },
		{ name: 'CrimsonCoyote', points: 7000 },
		{ name: 'BlueBird', points: 4000 },
		{ name: 'HarshHistory', points: 40 },
		{ name: 'TurboTurtle', points: 30 },
		{ name: 'SilentShadow', points: 20 },
		{ name: 'SlySpeed', points: 10 }
	];

	onMount(() => {
		view = $page.url.searchParams.get('view') ?? '';
		cohortName = $page.params.cohortName;

		const userCohort = localStorage.getItem('userCohort');

		if (!userCohort || userCohort === 'undefined' || userCohort === '' || userCohort === null) {
			goto('/cohort/join');
			return;
		}

		if (userCohort !== cohortName) {
			goto('/cohort/join');
			return;
		}

		if (!view) {
			goto(`/cohort/${cohortName}?view=chat`);
			return;
		}

		if (view !== 'chat' && view !== 'leaderboard') {
			goto(`/cohort/${cohortName}/missing`);
			return;
		}
	});

	function toggleOptions() {
		showOptions = !showOptions;
	}

	function renameCohort() {
		const newName = prompt('Enter new cohort name:', cohortName);
		if (newName && newName !== cohortName) {
			cohortName = newName;
			localStorage.setItem('userCohort', newName);
			goto(`/cohort/${newName}?view=${view}`);
		}
		showOptions = false;
	}

	function leaveCohort() {
		const confirmLeave = confirm('Are you sure you want to leave this cohort?');
		if (confirmLeave) {
			localStorage.removeItem('userCohort');
			goto('/cohort/join');
		} else {
			showOptions = false;
		}
	}

	$: view = $page.url.searchParams.get('view') ?? 'chat';
</script>

<svelte:head>
	<title>Beetcode - {cohortName} Cohort</title>
</svelte:head>

<div
	class="fixed top-[6rem] left-[24rem] z-[9] w-[calc(42vw)] overflow-y-hidden whitespace-nowrap select-none"
>
	<h1
		class="inline-block text-6xl font-bold text-[color:var(--color-accent-2)]"
		style="font-family: var(--font-ariw9500);"
	>
		{cohortName} Cohort
	</h1>
</div>

<div class="-mt-[3px] flex w-[18rem] gap-4 pr-98 pl-10">
	<PixelFrame
		className="flex-1 px-6 py-2 flex items-center justify-start  bg-[linear-gradient(to_bottom,var(--color-tile),var(--color-accent-3))]"
	>
		<nav class="mt-2 flex gap-6 text-lg font-semibold">
			<a
				href="?view=chat"
				class={view === 'chat'
					? 'text-[color:var(--color-primary)]'
					: 'text-[color:var(--color-text)]'}
			>
				Chat
			</a>
			<a
				href="?view=leaderboard"
				class={view === 'leaderboard'
					? 'text-[color:var(--color-primary)]'
					: 'text-[color:var(--color-text)]'}
			>
				Leaderboard
			</a>
			<div class="relative">
				<button
					class="scale-y-[-1] rounded px-1 py-1 text-xl font-bold transition hover:bg-[color:var(--color-accent-1)]"
					onclick={toggleOptions}
					aria-label="Cohort options"
				>
					…
				</button>

				{#if showOptions}
					<button
						type="button"
						class="fixed top-0 left-0 z-40 h-screen w-screen border-none bg-transparent"
						aria-label="Close dropdown"
						onclick={toggleOptions}
					></button>

					<div class="absolute top-full right-0 z-999 mt-1 translate-x-[1.5rem]">
						<PixelFrame
							className="w-48 bg-[color:var(--color-tile)] shadow-lg border-[color:var(--color-accent-2)] p-2"
						>
							<button
								onclick={renameCohort}
								class="block w-full px-4 py-2 text-left hover:rounded-md hover:bg-[color:var(--color-accent-1)]"
							>
								Rename Cohort
							</button>
							<button
								onclick={leaveCohort}
								class="z-9999 block w-full px-4 py-2 text-left text-red-500 hover:rounded-md hover:bg-[color:var(--color-accent-1)]"
							>
								Leave Cohort
							</button>
						</PixelFrame>
					</div>
				{/if}
			</div>
		</nav>
	</PixelFrame>
</div>

<div class="flex items-start justify-between px-6 pr-16">
	<div class="w-[80vw]">
		{#if view === 'chat'}
			<Chat />
		{:else if view === 'leaderboard'}
			<Leaderboard />
		{/if}
	</div>

	<PixelFrame
		className="h-[74vh] mt-[3.8rem] w-[24vw] flex flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<h1
			class="m-5 mt-2 ml-4 p-4 text-5xl font-bold text-[color:var(--color-accent-2)]"
			style="font-family: var(--font-ariw9500);"
		>
			Members
		</h1>

		<div class="mt-2 ml-[1rem] h-[43vh] w-full flex-1 overflow-auto px-4">
			{#each allUsers as user}
				<div
					class="mb-2 w-[90%] rounded-xl border-3 border-[color:var(--color-accent-1)] bg-[color:var(--color-bg)] px-3 py-2 text-sm text-[color:var(--color-text)]"
				>
					{user.name}
				</div>
			{/each}
		</div>

		<div class=" mt-4 h-[18vh] px-4 pb-4">
			<PixelFrame
				className="w-full rounded-xl px-4 py-4 bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-1))] flex flex-col items-start text-left"
			>
				<p class="mb-2 text-xs leading-tight text-[color:var(--color-text)]">
					Share this link to invite others to your cohort
				</p>
				<div class="flex w-full justify-center">
					<button
						onclick={() =>
							navigator.clipboard.writeText(`${window.location.origin}/cohort/${cohortName}`)}
						class="rounded bg-[color:var(--color-accent-2)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--color-accent-2)]"
					>
						Copy Invite Link
					</button>
				</div>
			</PixelFrame>
		</div>
	</PixelFrame>
</div>
