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

{#if view === 'chat'}
	<Chat />
{:else if view === 'leaderboard'}
	<Leaderboard />
{/if}
