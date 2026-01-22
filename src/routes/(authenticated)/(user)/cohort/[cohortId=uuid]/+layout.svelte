<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { HubConnectionState, type HubConnection } from '@microsoft/signalr';

	import type { DuckDto } from '../../Shop/Dtos';
	import { cohortApi, type CohortMemberDto, type CohortDetailsDto } from '$lib/api/cohort';

	import Welcome from './_parts/welcome.svelte';
	import Nav from './_parts/nav.svelte';
	import Activity from './_parts/activity.svelte';

	import type { PresenceState } from './presence';
	import { applyPresenceUpdate, mergeSnapshot, buildUsers } from './presence';
	import { attachActivityListeners } from './activityListeners';
	import { pickWelcomeDuckPath } from './ducks';

	let { data, children } = $props<{
		data: {
			cohort: CohortDetailsDto;
			members: CohortMemberDto[];
			activeMembers: { userId: string; lastSeenAt: string; isActive: boolean }[];
			ducks: DuckDto[];
		};
		children: () => any;
	}>();

	type ActiveMemberSeed = { userId: string; lastSeenAt: string; isActive: boolean };

	const ACTIVE_WINDOW_MS = 60_000;
	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;

	let cohort = $state<CohortDetailsDto>(data.cohort);
	let members = $state<CohortMemberDto[]>(data.members ?? []);
	let nowTick = $state(Date.now());

	let presence = $state<Record<string, PresenceState>>(
		Object.fromEntries(
			(data.activeMembers ?? []).map((m: ActiveMemberSeed) => [
				m.userId,
				{
					status: 'Active',
					lastActivityAt: m.lastSeenAt,
					lastSeenAt: m.lastSeenAt,
					connectionCount: 1
				}
			])
		)
	);

	let connection = $state<HubConnection | null>(null);

	let pollHandle = $state<number | null>(null);
	let tickHandle = $state<number | null>(null);
	let snapshotHandle = $state<number | null>(null);
	let detachActivity = $state<null | (() => void)>(null);

	const welcomeDuckPath = $state<string>(pickWelcomeDuckPath(data.ducks ?? [], defaultAvatar));

	const activeTab = $derived.by(() => {
		const p = page.url.pathname;
		return p.includes('/leaderboard') ? 'leaderboard' : 'chat';
	});

	const uiUsers = $derived.by(() =>
		buildUsers(members ?? [], presence, nowTick, ACTIVE_WINDOW_MS, defaultAvatar)
	);

	const refreshMembersOnly = async () => {
		try {
			members = await cohortApi.getAllMembers(cohort.cohortId);
		} catch {}
	};

	const requestSnapshot = async () => {
		const c = connection;
		if (!c) return;
		if (c.state !== HubConnectionState.Connected) return;
		try {
			await c.invoke('RequestPresenceSnapshot');
		} catch {}
	};

	let lastReportMs = 0;

	const reportActivity = async () => {
		const c = connection;
		if (!c) return;
		if (c.state !== HubConnectionState.Connected) return;
		if (document.visibilityState !== 'visible') return;

		const nowMs = Date.now();
		if (nowMs - lastReportMs < 12_000) return;
		lastReportMs = nowMs;

		try {
			await c.invoke('ReportActivity');
		} catch {}
	};

	const setTab = (tab: 'chat' | 'leaderboard') => {
		goto(`/cohort/${cohort.cohortId}/${tab}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
			invalidateAll: false
		});
	};

	const renameCohort = async () => {
		const newName = prompt('Enter new cohort name:', cohort.name);
		if (!newName || newName === cohort.name) return;

		try {
			const updated = await cohortApi.rename({ cohortId: cohort.cohortId, name: newName });
			cohort = updated;
		} catch (err) {
			const msg = err instanceof Error ? err.message : 'Failed to rename cohort.';
			alert(msg);
		}
	};

	const leaveCohort = async () => {
		const confirmLeave = confirm('Are you sure you want to leave this cohort?');
		if (!confirmLeave) return;

		try {
			await cohortApi.leave();
		} catch {}

		goto('/cohort/join');
	};

	onMount(async () => {
		await refreshMembersOnly();

		try {
			const c = cohortApi.createChatConnection(cohort.cohortId, {
				onPresenceUpdated: (u) => {
					presence = applyPresenceUpdate(presence, u as any);
				}
			});

			connection = c;

			c.on('PresenceSnapshot', (payload: any) => {
				presence = mergeSnapshot(members ?? [], presence, payload);
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

		detachActivity = attachActivityListeners(
			() => {
				reportActivity();
			},
			() => {
				requestSnapshot();
			}
		);

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
		connection = null;

		if (c) {
			try {
				await c.stop();
			} catch {}
		}
	});
</script>

<svelte:head>
	<title>{cohort.name} Cohort - AlgoDuck</title>
</svelte:head>

<div
	class="fixed top-[5rem] left-[24rem] z-[9] w-[calc(42vw)] overflow-y-hidden whitespace-nowrap select-none"
></div>

<div class="fixed top-[11rem] left-[0rem] z-[99999] -mt-[1px] flex w-[18rem] pr-100 pl-18">
	<div class="relative w-full">
		<div class="absolute -top-[5.4rem] left-[1.5rem] z-10">
			<Welcome name={cohort.name} code={cohort.joinCode ?? ''} duckPath={welcomeDuckPath} />
		</div>

		<Nav {activeTab} onTab={setTab} onRename={renameCohort} onLeave={leaveCohort} />
	</div>
</div>

<div class="flex items-start justify-between overflow-x-auto px-6 pr-16">
	<Activity users={uiUsers} />

	<div class="w-[80vw]">
		{@render children()}
	</div>
</div>
