<script lang="ts">
	import Chat from './chat.svelte';
	import Leaderboard from './leaderboard.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

	let view = '';
	let cohortName = '';
	let showOptions = false;
	let copied = false;
	type User = {
		name: string;
		points: number;
		isOnline: boolean;
	};

	const allUsers: User[] = [
		{ name: 'FrostedFalcon', points: 15000, isOnline: true },
		{ name: 'EchoOrbit', points: 100, isOnline: false },
		{ name: 'PixelPenguin', points: 9000, isOnline: true },
		{ name: 'NovaNebula', points: 80, isOnline: false },
		{ name: 'CrimsonCoyote', points: 7000, isOnline: true },
		{ name: 'BlueBird', points: 4000, isOnline: false },
		{ name: 'HarshHistory', points: 40, isOnline: true },
		{ name: 'TurboTurtle', points: 30, isOnline: false },
		{ name: 'SilentShadow', points: 20, isOnline: true },
		{ name: 'SlySpeed', points: 10, isOnline: false },
		{ name: 'SlySpeeding', points: 9, isOnline: true },
		{ name: 'SlySpeeder', points: 8, isOnline: false },
		{ name: 'SlySpider', points: 7, isOnline: true }
	];

	let sortedUsers: User[] = [];

	$: sortedUsers = [...allUsers].sort((a, b) => {
		if (a.isOnline !== b.isOnline) {
			return a.isOnline ? -1 : 1;
		}
		return a.name.localeCompare(b.name);
	});

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
></div>

<div class="-mt-[1px] flex w-[18rem] pr-100 pl-20">
	<PixelFrameSimple
		className="text-[color:var(--color-landingpage-subtitle)] flex-1 px-6 py-1 z-60 flex items-center justify-start bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<nav class="mt-2 flex gap-6 text-lg font-semibold">
			<button
				onclick={() => setView('chat')}
				class={view === 'chat'
					? 'text-[color:var(--color-primary)]'
					: 'text-[color:var(--color-landingpage-subtitle)]'}
			>
				Chat
			</button>
			<button
				onclick={() => setView('leaderboard')}
				class={view === 'leaderboard'
					? 'text-[color:var(--color-primary)]'
					: 'text-[color:var(--color-landingpage-subtitle)]'}
			>
				Leaderboard
			</button>
			<div class="relative">
				<button
					class="scale-y-[-1] rounded py-1 text-xl font-bold transition hover:bg-[color:var(--color-accent-3)]"
					onclick={toggleOptions}
					aria-label="Cohort options"
				>
					…
				</button>

				{#if showOptions}
					<button
						type="button"
						class="fixed top-0 left-0 z-99 h-screen w-screen border-none bg-transparent"
						aria-label="Close dropdown"
						onclick={toggleOptions}
					></button>

					<div class="absolute top-full right-0 z-999 mt-0 translate-x-[1.5rem]">
						<PixelFrameSimple
							className="w-48 bg-[color:var(--color-accent-3)] shadow-lg border-[color:var(--color-accent-4)] p-2"
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
						</PixelFrameSimple>
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

	<PixelFrameSimple
		className="h-[74vh] mt-[3rem] w-[25vw] flex flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<div class="absolute -top-[5.6rem] left-[10%] z-10 -translate-x-10">
			<div class="flex items-center gap-1">
				<div class="relative ml-2 translate-y-[-12px]">
					<div
						class="w-[12rem] overflow-auto rounded-3xl border-2 border-black bg-white/100 px-5 py-2 text-sm font-semibold text-black shadow-lg"
					>
						<p class="leading-snug">Welcome to <br /> {cohortName} Cohort!</p>
					</div>
					<div
						class="absolute top-1/2 -right-1.5 h-3 w-3 -translate-y-1/4 rotate-45 border-t-2 border-r-2 border-black bg-white/100"
					></div>
				</div>

				<CloudfrontImage
					path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
					cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2 "
				/>
			</div>
		</div>

		<h1
			class="ocr-outline ocr-title isolate m-4 mx-auto mt-1 mb-0 ml-3 block max-w-[20rem] overflow-x-auto p-4 text-left [font-family:var(--font-ariw9500)] text-4xl leading-[1.5] font-bold tracking-widest whitespace-nowrap text-[var(--color-landingpage-title)]"
		>
			Activity
		</h1>

		<div class="mt-2 ml-[1rem] h-[58vh] w-full flex-1 overflow-auto px-4">
			{#each sortedUsers as user}
				<div class="mb-4 flex w-[90%] items-center gap-3">
					<div class="relative h-12 w-12 shrink-0">
						<div
							class="h-full w-full overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
						>
							<CloudfrontImage
								path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
								cls="h-full w-full -translate-x-[-15%] -translate-y-[-5%] scale-[1.5] object-cover object-[left_top]"
							/>
						</div>
						<span
							class={`absolute right-0 bottom-0 h-4 w-4 rounded-full border-[2px] border-[color:var(--color-white)] ${
								user.isOnline ? 'bg-green-400' : 'bg-gray-500'
							}`}
						></span>
					</div>

					<PixelFrameSimple className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm text-black">
						<span class="font-semibold">{user.name}</span>
					</PixelFrameSimple>
				</div>
			{/each}
		</div>
	</PixelFrameSimple>
</div>
