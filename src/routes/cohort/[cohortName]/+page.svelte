<script lang="ts">
	import Chat from './chat.svelte';
	import Leaderboard from './leaderboard.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import duck from '$lib/images/ducks/duck.png';

	let view = '';
	let cohortName = '';
	let showOptions = false;
	let copied = false;

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
		{ name: 'SlySpeed', points: 10 },
		{ name: 'SlySpeeding', points: 9 },
		{ name: 'SlySpeeder', points: 8 },
		{ name: 'SlySpider', points: 7 }
	];

	onMount(() => {
		view = page.url.searchParams.get('view') ?? '';
		cohortName = page.params.cohortName ?? '';

		const userCohort = localStorage.getItem('userCohort');

		if (!userCohort) {
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

	async function copyInviteLink() {
		const url = `${window.location.origin}/cohort/${cohortName}`;
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function setView(v: 'chat' | 'leaderboard') {
		view = v;
		const url = new URL(window.location.href);
		url.searchParams.set('view', v);
		goto(url.pathname + url.search, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
			invalidateAll: false
		});
	}

	$: view = page.url.searchParams.get('view') ?? 'chat';
</script>

<svelte:head>
	<title>{cohortName} Cohort - AlgoDuck</title>
</svelte:head>

<div
	class="fixed top-[5rem] left-[24rem] z-[9] w-[calc(42vw)] overflow-y-hidden whitespace-nowrap select-none"
>
	<h1
		class="inline-block text-6xl leading-[1.5] font-bold text-[color:var(--color-accent-2)]"
		style="font-family: var(--font-ariw9500);"
	>
		{cohortName} Cohort
	</h1>
</div>

<div class="-mt-[3px] flex w-[18rem] pr-100 pl-20">
	<PixelFrameSimple
		className="flex-1 px-6 py-2 flex items-center justify-start bg-[linear-gradient(to_bottom,var(--color-tile),var(--color-accent-3))]"
	>
		<nav class="mt-2 flex gap-6 text-lg font-semibold">
			<button
				onclick={() => setView('chat')}
				class={view === 'chat'
					? 'text-[color:var(--color-primary)]'
					: 'text-[color:var(--color-text)]'}
			>
				Chat
			</button>
			<button
				onclick={() => setView('leaderboard')}
				class={view === 'leaderboard'
					? 'text-[color:var(--color-primary)]'
					: 'text-[color:var(--color-text)]'}
			>
				Leaderboard
			</button>
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
								onclick={copyInviteLink}
								class="block w-full px-4 py-2 text-left hover:rounded-md hover:bg-[color:var(--color-accent-1)]"
							>
								{#if copied}Copied!{/if}{#if !copied}Copy invite link{/if}
							</button>

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
	</PixelFrameSimple>
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
		className="h-[74vh] mt-[4rem] w-[24vw] flex flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<div class="absolute -top-[4.4rem] left-1/2 z-10 flex -translate-x-1/3 gap-2">
			<img src={duck} alt="duck" class="h-[5rem] w-[5.1rem] -scale-x-100 drop-shadow-md" />
			<img src={duck} alt="duck" class="h-[5rem] w-[5.1rem] drop-shadow-md" />
		</div>

		<h1
			class="m-5 mt-2 ml-4 overflow-auto p-4 text-5xl font-bold text-[color:var(--color-accent-2)]"
			style="font-family: var(--font-ariw9500);"
		>
			Members
		</h1>

		<div class="mt-2 ml-[1rem] h-[58vh] w-full flex-1 overflow-auto px-5">
			{#each allUsers as user}
				<div class="mb-3 flex w-[90%] items-center gap-3">
					<div
						class="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[color:var(--color-primary)] shadow"
					>
						<img
							src={duck}
							alt="duck"
							class="h-full w-full -translate-x-[-15%] -translate-y-[-10%] scale-[1.5] object-cover object-[left_top]"
						/>
					</div>
					<PixelFrameSimple
						className="flex-1 rounded-2xl bg-[color:var(--color-bg)] px-4 py-3 text-sm text-[color:var(--color-text)]"
					>
						<span class="font-semibold">{user.name}</span>
					</PixelFrameSimple>
				</div>
			{/each}
		</div>
	</PixelFrame>
</div>
