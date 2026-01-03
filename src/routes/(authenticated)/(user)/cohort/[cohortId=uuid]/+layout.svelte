<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { DuckDto } from '../../Shop/Dtos';
	import {
		cohortApi,
		type CohortMemberDto,
		type PresenceUpdatedDto,
		type CohortDetailsDto,
		type CohortActiveMemberDto
	} from '$lib/api/cohort';
	import type { HubConnection } from '@microsoft/signalr';

	let { data, children } = $props<{
		data: {
			cohort: CohortDetailsDto;
			members: CohortMemberDto[];
			activeMembers: { userId: string; lastSeenAt: string; isActive: boolean }[];
			ducks: DuckDto[];
		};
		children: () => any;
	}>();

	let cohort = $state<CohortDetailsDto>(data.cohort);
	let members = $state<CohortMemberDto[]>(data.members ?? []);

	type PresenceStatus = 'Active' | 'Away' | 'Offline';

	type PresenceState = {
		status: PresenceStatus;
		lastActivityAt: string;
		lastSeenAt: string;
		connectionCount: number;
	};

	const nowIso = () => new Date().toISOString();
	const ACTIVE_WINDOW_MS = 60_000;

	let presence = $state<Record<string, PresenceState>>(
		Object.fromEntries(
			(data.activeMembers ?? []).map(
				(m: { userId: string; lastSeenAt: string; isActive: boolean }) => [
					m.userId,
					{
						status: 'Active',
						lastActivityAt: m.lastSeenAt,
						lastSeenAt: m.lastSeenAt,
						connectionCount: 1
					}
				]
			)
		)
	);

	let showOptions = $state(false);

	let connection = $state<HubConnection | null>(null);
	let pollHandle = $state<number | null>(null);
	let tickHandle = $state<number | null>(null);
	let snapshotHandle = $state<number | null>(null);
	let nowTick = $state(Date.now());

	let lastReportMs = 0;

	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;

	const ducks: DuckDto[] = data.ducks ?? [];

	const pickOneRandomDuck = (list: DuckDto[]): DuckDto | null => {
		const shuffled = [...list].sort(() => Math.random() - 0.5);
		return shuffled.length ? shuffled[0] : null;
	};

	let welcomeDuck = $state<DuckDto | null>(pickOneRandomDuck(ducks));

	const welcomeDuckPath = $derived.by(() =>
		welcomeDuck ? `Ducks/Outfits/duck-${welcomeDuck.id}.png` : defaultAvatar
	);

	type User = {
		name: string;
		points: number;
		status: 'active' | 'away' | 'offline';
		avatarPath: string;
		badgeText: string;
		badgeTitle: string;
	};

	const formatAgeShort = (iso: string | null | undefined, nowMs: number) => {
		if (!iso) return '';
		const t = new Date(iso).getTime();
		if (!Number.isFinite(t)) return '';

		let diffSec = Math.floor((nowMs - t) / 1000);
		if (diffSec < 0) diffSec = 0;

		const min = Math.floor(diffSec / 60);
		if (min < 1) return 'now';
		if (min < 60) return `${min}m`;

		const hrs = Math.floor(min / 60);
		if (hrs < 24) return `${hrs}h`;

		const days = Math.floor(hrs / 24);
		return `${days}d`;
	};

	const formatAgeFull = (iso: string | null | undefined, nowMs: number) => {
		if (!iso) return '';
		const t = new Date(iso).getTime();
		if (!Number.isFinite(t)) return '';

		let diffSec = Math.floor((nowMs - t) / 1000);
		if (diffSec < 0) diffSec = 0;

		if (diffSec < 60) return 'Active less than a minute ago';

		const min = Math.floor(diffSec / 60);
		if (min < 60) return `Active ${min} minute${min === 1 ? '' : 's'} ago`;

		const hrs = Math.floor(min / 60);
		if (hrs < 24) return `Active ${hrs} hour${hrs === 1 ? '' : 's'} ago`;

		const days = Math.floor(hrs / 24);
		return `Active ${days} day${days === 1 ? '' : 's'} ago`;
	};

	const activeTab = $derived.by(() => {
		const p = page.url.pathname;
		return p.includes('/leaderboard') ? 'leaderboard' : 'chat';
	});

	const computeUiStatus = (
		p: PresenceState | undefined,
		nowMs: number
	): 'active' | 'away' | 'offline' => {
		if (!p) return 'offline';

		const cc = p.connectionCount ?? 0;
		if (cc <= 0) return 'offline';

		const t = new Date(p.lastActivityAt).getTime();
		if (Number.isFinite(t) && nowMs - t <= ACTIVE_WINDOW_MS) return 'active';
		return 'away';
	};

	const sortedUsers = $derived.by(() => {
		const nowMs = nowTick;

		const list: User[] = (members ?? []).map((m: CohortMemberDto) => {
			const p = presence[m.userId];
			const ui = computeUiStatus(p, nowMs);

			const avatarPath = m.userAvatarUrl ? m.userAvatarUrl : defaultAvatar;

			if (ui === 'active') {
				return {
					name: m.userName,
					points: 0,
					status: 'active',
					avatarPath,
					badgeText: '',
					badgeTitle: 'Active now'
				};
			}

			if (ui === 'away') {
				const short = formatAgeShort(p?.lastActivityAt ?? p?.lastSeenAt ?? null, nowMs);
				const full = formatAgeFull(p?.lastActivityAt ?? p?.lastSeenAt ?? null, nowMs);
				return {
					name: m.userName,
					points: 0,
					status: 'away',
					avatarPath,
					badgeText: short,
					badgeTitle: full ? `Away · ${full}` : 'Away'
				};
			}

			return {
				name: m.userName,
				points: 0,
				status: 'offline',
				avatarPath,
				badgeText: '',
				badgeTitle: 'Offline'
			};
		});

		const order = (s: 'active' | 'away' | 'offline') => (s === 'active' ? 0 : s === 'away' ? 1 : 2);

		list.sort((a: User, b: User) => {
			const oa = order(a.status);
			const ob = order(b.status);
			if (oa !== ob) return oa - ob;
			return a.name.localeCompare(b.name);
		});

		return list;
	});

	const normalizeStatus = (v: unknown): PresenceStatus => {
		if (typeof v === 'string') {
			const s = v.trim().toLowerCase();
			if (s === 'active') return 'Active';
			if (s === 'away') return 'Away';
			if (s === 'offline') return 'Offline';
		}
		return 'Offline';
	};

	const applyPresenceUpdate = (u: PresenceUpdatedDto & any) => {
		const prev = presence[u.userId];
		const now = nowIso();

		const status: PresenceStatus = u.status
			? normalizeStatus(u.status)
			: u.isActive
				? 'Active'
				: 'Offline';

		const lastActivityAtRaw =
			typeof u.lastActivityAt === 'string' && u.lastActivityAt.trim() ? u.lastActivityAt : '';

		const lastSeenAtRaw =
			typeof u.lastSeenAt === 'string' && u.lastSeenAt.trim() ? u.lastSeenAt : '';

		const connectionCount =
			typeof u.connectionCount === 'number' && Number.isFinite(u.connectionCount)
				? u.connectionCount
				: (prev?.connectionCount ?? (status === 'Offline' ? 0 : 1));

		const nextLastActivityAt =
			lastActivityAtRaw ||
			(status === 'Active' ? now : prev?.status === 'Active' ? now : (prev?.lastActivityAt ?? now));

		const nextLastSeenAt =
			lastSeenAtRaw ||
			(status === 'Offline'
				? prev?.status !== 'Offline'
					? now
					: (prev?.lastSeenAt ?? '')
				: (prev?.lastSeenAt ?? now));

		presence = {
			...presence,
			[u.userId]: {
				status,
				lastActivityAt: nextLastActivityAt,
				lastSeenAt: nextLastSeenAt,
				connectionCount
			}
		};
	};

	const mergeSnapshot = (payload: any) => {
		const arr = Array.isArray(payload)
			? payload
			: Array.isArray(payload?.users)
				? payload.users
				: Array.isArray(payload?.items)
					? payload.items
					: null;

		if (!arr) return;

		const now = nowIso();

		const byId: Record<string, any> = {};
		for (const x of arr) {
			if (x?.userId) byId[String(x.userId)] = x;
		}

		const next: Record<string, PresenceState> = {};

		for (const m of members ?? []) {
			const prev = presence[m.userId];
			const found = byId[m.userId];

			if (found) {
				const status: PresenceStatus = found.status
					? normalizeStatus(found.status)
					: found.isActive
						? 'Active'
						: 'Offline';

				const lastActivityAtRaw =
					typeof found.lastActivityAt === 'string' && found.lastActivityAt.trim()
						? found.lastActivityAt
						: '';

				const lastSeenAtRaw =
					typeof found.lastSeenAt === 'string' && found.lastSeenAt.trim() ? found.lastSeenAt : '';

				const connectionCount =
					typeof found.connectionCount === 'number' && Number.isFinite(found.connectionCount)
						? found.connectionCount
						: (prev?.connectionCount ?? (status === 'Offline' ? 0 : 1));

				next[m.userId] = {
					status,
					lastActivityAt:
						lastActivityAtRaw || (status === 'Active' ? now : (prev?.lastActivityAt ?? now)),
					lastSeenAt:
						lastSeenAtRaw ||
						(status === 'Offline'
							? prev?.status !== 'Offline'
								? now
								: (prev?.lastSeenAt ?? '')
							: (prev?.lastSeenAt ?? now)),
					connectionCount
				};

				continue;
			}

			next[m.userId] = {
				status: 'Offline',
				lastActivityAt: prev?.lastActivityAt ?? now,
				lastSeenAt: prev?.lastSeenAt ?? '',
				connectionCount: 0
			};
		}

		presence = next;
	};

	const refreshMembersOnly = async () => {
		try {
			members = await cohortApi.getAllMembers(cohort.cohortId);
		} catch {}
	};

	const requestSnapshot = async () => {
		const c = connection;
		if (!c) return;
		if ((c as any).state !== 'Connected') return;

		try {
			await c.invoke('RequestPresenceSnapshot');
		} catch {}
	};

	const reportActivity = async () => {
		const c = connection;
		if (!c) return;
		if ((c as any).state !== 'Connected') return;
		if (document.visibilityState !== 'visible') return;

		const nowMs = Date.now();
		if (nowMs - lastReportMs < 12_000) return;
		lastReportMs = nowMs;

		try {
			await c.invoke('ReportActivity');
		} catch {}
	};

	const attachActivityListeners = () => {
		const onAny = () => {
			reportActivity();
		};

		const onVis = () => {
			if (document.visibilityState === 'visible') {
				reportActivity();
				requestSnapshot();
			}
		};

		window.addEventListener('mousemove', onAny, { passive: true });
		window.addEventListener('keydown', onAny);
		window.addEventListener('touchstart', onAny, { passive: true });
		window.addEventListener('focus', onAny);
		document.addEventListener('visibilitychange', onVis);

		return () => {
			window.removeEventListener('mousemove', onAny as any);
			window.removeEventListener('keydown', onAny as any);
			window.removeEventListener('touchstart', onAny as any);
			window.removeEventListener('focus', onAny as any);
			document.removeEventListener('visibilitychange', onVis as any);
		};
	};

	let detachActivity: null | (() => void) = null;

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
		await refreshMembersOnly();

		try {
			const c = cohortApi.createChatConnection(cohort.cohortId, {
				onPresenceUpdated: (u) => {
					applyPresenceUpdate(u);
				}
			});

			connection = c;

			c.on('PresenceSnapshot', (payload: any) => {
				mergeSnapshot(payload);
			});

			try {
				await c.start();
				await requestSnapshot();
				await reportActivity();
			} catch {
				connection = null;
			}
		} catch {
			connection = null;
		}

		detachActivity = attachActivityListeners();

		pollHandle = window.setInterval(refreshMembersOnly, 20_000);
		tickHandle = window.setInterval(() => {
			nowTick = Date.now();
		}, 5_000);
		snapshotHandle = window.setInterval(() => {
			requestSnapshot();
		}, 15_000);
	});

	onDestroy(async () => {
		if (detachActivity) detachActivity();
		detachActivity = null;

		if (pollHandle) window.clearInterval(pollHandle);
		pollHandle = null;

		if (tickHandle) window.clearInterval(tickHandle);
		tickHandle = null;

		if (snapshotHandle) window.clearInterval(snapshotHandle);
		snapshotHandle = null;

		const c = connection;
		if (c) {
			try {
				await c.stop();
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
						Welcome to Cohort: {cohort.name}! <br />
						Code to join: {cohort.joinCode ?? ''}
					</p>
				</div>
				<div
					class="absolute top-1/2 -left-[0.3rem] h-3 w-3 -translate-y-1/3 rotate-45 border-b-3 border-l-3 border-black bg-[color:var(--color-landingpage-subtitle)]"
				></div>
			</div>

			<CloudfrontImage
				path={welcomeDuckPath}
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
								cls="h-full w-full -translate-x-[-15%] -translate-y-[0%] scale-[1.5] object-cover object-[left_top]"
							/>
						</div>

						<span
							title={user.badgeTitle}
							class={`absolute right-0 bottom-0 h-4 w-4 rounded-full border-[2px] border-[color:var(--color-white)] ${
								user.status === 'active'
									? 'bg-green-400'
									: user.status === 'away'
										? 'bg-yellow-500'
										: 'bg-gray-500'
							} ${
								user.status === 'away' && user.badgeText
									? 'flex items-center justify-center px-3 py-2 text-[0.55rem] leading-none font-semibold text-white'
									: ''
							}`}
						>
							{#if user.status === 'away' && user.badgeText}
								{user.badgeText}
							{/if}
						</span>
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
