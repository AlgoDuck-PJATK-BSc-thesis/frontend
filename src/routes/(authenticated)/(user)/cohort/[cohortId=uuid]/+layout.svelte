<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import {
		cohortApi,
		type CohortMemberDto,
		type PresenceUpdatedDto,
		type CohortDetailsDto
	} from '$lib/api/cohort';
	import type { HubConnection } from '@microsoft/signalr';

	let { data, children } = $props<{
		data: {
			cohort: CohortDetailsDto;
			members: CohortMemberDto[];
			activeMembers: { userId: string; lastSeenAt: string; isActive: boolean }[];
		};
		children: () => any;
	}>();

	let cohort = $state<CohortDetailsDto>(data.cohort);
	let members = $state<CohortMemberDto[]>(data.members ?? []);

	type PresenceState = { isActive: boolean; lastSeenAt: string };
	let presence = $state<Record<string, PresenceState>>(
		Object.fromEntries(
			(data.activeMembers ?? []).map(
				(m: { userId: string; lastSeenAt: string; isActive: boolean }) => [
					m.userId,
					{ isActive: true, lastSeenAt: m.lastSeenAt }
				]
			)
		)
	);

	let showOptions = $state(false);

	let connection = $state<HubConnection | null>(null);
	let pollHandle = $state<number | null>(null);

	const defaultAvatar = `Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`;

	type User = {
		name: string;
		points: number;
		isOnline: boolean;
		avatarPath: string;
	};

	const activeTab = $derived.by(() => {
		const p = page.url.pathname;
		return p.includes('/leaderboard') ? 'leaderboard' : 'chat';
	});

	const sortedUsers = $derived.by(() => {
		const list: User[] = (members ?? []).map((m: CohortMemberDto) => {
			const p = presence[m.userId];
			return {
				name: m.userName,
				points: 0,
				isOnline: !!p?.isActive,
				avatarPath: m.userAvatarUrl ? m.userAvatarUrl : defaultAvatar
			};
		});

		list.sort((a: User, b: User) => {
			if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
			return a.name.localeCompare(b.name);
		});

		return list;
	});

	const applyPresenceUpdate = (u: PresenceUpdatedDto) => {
		presence = {
			...presence,
			[u.userId]: { isActive: !!u.isActive, lastSeenAt: u.lastSeenAt }
		};
	};

	const refreshMembersAndPresence = async () => {
		try {
			members = await cohortApi.getAllMembers(cohort.cohortId);
		} catch {}

		try {
			const active = await cohortApi.getActiveMembers(cohort.cohortId);
			const next: Record<string, PresenceState> = {};
			for (const a of active) next[a.userId] = { isActive: true, lastSeenAt: a.lastSeenAt };
			presence = next;
		} catch {}
	};

	function toggleOptions() {
		showOptions = !showOptions;
	}

	function setTab(tab: 'chat' | 'leaderboard') {
		goto(`/cohort/${cohort.cohortId}/${tab}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
			invalidateAll: false
		});
	}

	async function renameCohort() {
		const newName = prompt('Enter new cohort name:', cohort.name);
		if (!newName || newName === cohort.name) {
			showOptions = false;
			return;
		}

		try {
			const updated = await cohortApi.rename({ cohortId: cohort.cohortId, name: newName });
			cohort = updated;
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to rename cohort.';
			alert(msg);
		}

		showOptions = false;
	}

	async function leaveCohort() {
		const confirmLeave = confirm('Are you sure you want to leave this cohort?');
		if (!confirmLeave) {
			showOptions = false;
			return;
		}

		try {
			await cohortApi.leave();
		} catch {}

		goto('/cohort/join');
	}

	onMount(async () => {
		try {
			connection = cohortApi.createChatConnection(cohort.cohortId, {
				onPresenceUpdated: (u) => {
					applyPresenceUpdate(u);
				}
			});

			try {
				await connection.start();
			} catch {}
		} catch {
			connection = null;
		}

		pollHandle = window.setInterval(refreshMembersAndPresence, 20000);
	});

	onDestroy(async () => {
		if (pollHandle) window.clearInterval(pollHandle);
		pollHandle = null;

		if (connection) {
			try {
				await connection.stop();
			} catch {}
		}
		connection = null;
	});
</script>

<svelte:head>
	<title>{cohort.name} Cohort - AlgoDuck</title>
</svelte:head>

<div
	class="fixed top-[5rem] left-[24rem] z-[9] w-[calc(42vw)] overflow-y-hidden whitespace-nowrap select-none"
></div>

<div class="fixed top-[11rem] left-[0rem] z-[99999] -mt-[1px] flex w-[18rem] pr-100 pl-18">
	<div class="absolute -top-[5.4rem] left-[3rem] z-10 -translate-x-50">
		<div class="flex items-center gap-1">
			<div class="relative left-[23rem] ml-2 translate-y-[-20px]">
				<div
					class=" w-[16rem] overflow-auto rounded-3xl border-3 border-black bg-[color:var(--color-landingpage-subtitle)] px-5 py-2 text-sm font-semibold text-[color:var(--color-shadow-black)] shadow-lg"
				>
					<p class="leading-snug">
						Welcome to {cohort.name}! <br />
						Code to join: {cohort.joinCode ?? ''}
					</p>
				</div>
				<div
					class="absolute top-1/2 -left-[0.3rem] h-3 w-3 -translate-y-1/3 rotate-45 border-b-3 border-l-3 border-black bg-[color:var(--color-landingpage-subtitle)]"
				></div>
			</div>

			<CloudfrontImage
				path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
				cls="h-[7rem] w-[7.2rem] -scale-x-100 drop-shadow-md "
			/>
		</div>
	</div>

	<PixelFrameSimple
		className="text-[color:var(--color-landingpage-subtitle)] flex-1 px-6 py-1 z-[99999] flex items-center justify-start bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<nav class="mt-2 mb-1 flex gap-6 text-lg font-semibold">
			<button
				onclick={() => setTab('chat')}
				class={activeTab === 'chat'
					? 'text-[color:var(--color-primary)]'
					: 'text-[color:var(--color-landingpage-subtitle)]'}
			>
				Chat
			</button>
			<button
				onclick={() => setTab('leaderboard')}
				class={activeTab === 'leaderboard'
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
								onclick={renameCohort}
								class="block w-full px-4 py-2 text-left hover:rounded-md hover:bg-[color:var(--color-accent-4)]"
							>
								Rename Cohort
							</button>
							<button
								onclick={leaveCohort}
								class="z-9999 block w-full px-4 py-2 text-left text-red-500 hover:rounded-md hover:bg-[color:var(--color-accent-4)]"
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

<div class="flex items-start justify-between overflow-x-auto px-6 pr-16">
	<PixelFrameSimple
		className="h-[64vh] min-w-[20rem] ml-[3rem] mt-[12rem] w-[25vw] flex flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<h1
			class="ocr-outline ocr-title mt-1 flex max-w-[20rem] justify-center overflow-x-auto p-4 [font-family:var(--font-ariw9500)] text-4xl leading-[1.5] font-bold tracking-widest whitespace-nowrap text-[var(--color-landingpage-title)]"
		>
			Activity
		</h1>

		<div class="mt-2 ml-[0rem] h-[58vh] w-full flex-1 overflow-auto px-4">
			{#each sortedUsers as user}
				<div class="mb-2 ml-4 flex w-[80%] items-center gap-3">
					<div class="relative h-12 w-12 shrink-0">
						<div
							class="h-full w-full overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
						>
							<CloudfrontImage
								path={user.avatarPath}
								cls="h-full w-full -translate-x-[-15%] -translate-y-[-5%] scale-[1.5] object-cover object-[left_top]"
							/>
						</div>
						<span
							class={`absolute right-0 bottom-0 h-4 w-4 rounded-full border-[2px] border-[color:var(--color-white)] ${
								user.isOnline ? 'bg-green-400' : 'bg-gray-500'
							}`}
						></span>
					</div>

					<PixelFrameSimple
						className="flex-1 rounded-2xl bg-[color:var(--color-landingpage-subtitle)] px-4 py-3 text-sm text-[color:var(--color-shadow-black)]"
					>
						<span class="font-semibold">{user.name}</span>
					</PixelFrameSimple>
				</div>
			{/each}
		</div>
	</PixelFrameSimple>

	<div class="w-[80vw]">
		{@render children()}
	</div>
</div>
