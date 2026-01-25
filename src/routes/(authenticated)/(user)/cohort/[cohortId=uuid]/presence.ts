import type { CohortMemberDto, PresenceUpdatedDto } from '$lib/api/cohort';

export type PresenceStatus = 'Active' | 'Away' | 'Offline';

export type PresenceState = {
	status: PresenceStatus;
	lastActivityAt: string;
	lastSeenAt: string;
	connectionCount: number;
};

export type UiStatus = 'active' | 'away' | 'offline';

export type UiUser = {
	name: string;
	points: number;
	status: UiStatus;
	avatarPath: string;
	badgeText: string;
	badgeTitle: string;
};

export const nowIso = () => new Date().toISOString();

export const formatAgeShort = (iso: string | null | undefined, nowMs: number) => {
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

export const formatAgeFull = (iso: string | null | undefined, nowMs: number) => {
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

export const normalizeStatus = (v: unknown): PresenceStatus => {
	if (typeof v === 'string') {
		const s = v.trim().toLowerCase();
		if (s === 'active') return 'Active';
		if (s === 'away') return 'Away';
		if (s === 'offline') return 'Offline';
	}
	return 'Offline';
};

export const computeUiStatus = (
	p: PresenceState | undefined,
	nowMs: number,
	activeWindowMs: number
): UiStatus => {
	if (!p) return 'offline';

	const cc = p.connectionCount ?? 0;
	if (cc <= 0) return 'offline';

	const t = new Date(p.lastActivityAt).getTime();
	if (Number.isFinite(t) && nowMs - t <= activeWindowMs) return 'active';
	return 'away';
};

export const applyPresenceUpdate = (
	prevPresence: Record<string, PresenceState>,
	u: PresenceUpdatedDto & any
): Record<string, PresenceState> => {
	const prev = prevPresence[u.userId];
	const now = nowIso();

	const status: PresenceStatus = u.status
		? normalizeStatus(u.status)
		: u.isActive
			? 'Active'
			: 'Offline';

	const lastActivityAtRaw =
		typeof u.lastActivityAt === 'string' && u.lastActivityAt.trim() ? u.lastActivityAt : '';

	const lastSeenAtRaw = typeof u.lastSeenAt === 'string' && u.lastSeenAt.trim() ? u.lastSeenAt : '';

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

	return {
		...prevPresence,
		[u.userId]: {
			status,
			lastActivityAt: nextLastActivityAt,
			lastSeenAt: nextLastSeenAt,
			connectionCount
		}
	};
};

export const mergeSnapshot = (
	members: CohortMemberDto[],
	prevPresence: Record<string, PresenceState>,
	payload: any
): Record<string, PresenceState> => {
	const arr = Array.isArray(payload)
		? payload
		: Array.isArray(payload?.users)
			? payload.users
			: Array.isArray(payload?.items)
				? payload.items
				: null;

	if (!arr) return prevPresence;

	const now = nowIso();

	const byId: Record<string, any> = {};
	for (const x of arr) {
		if (x?.userId) byId[String(x.userId)] = x;
	}

	const next: Record<string, PresenceState> = {};

	for (const m of members ?? []) {
		const prev = prevPresence[m.userId];
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

	return next;
};

export const buildUsers = (
	members: CohortMemberDto[],
	presence: Record<string, PresenceState>,
	nowMs: number,
	activeWindowMs: number,
	defaultAvatar: string
): UiUser[] => {
	const list: UiUser[] = (members ?? []).map((m: CohortMemberDto) => {
		const p = presence[m.userId];
		const ui = computeUiStatus(p, nowMs, activeWindowMs);

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
				badgeTitle: full ? `Away ${full}` : 'Away'
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

	const order = (s: UiStatus) => (s === 'active' ? 0 : s === 'away' ? 1 : 2);

	list.sort((a: UiUser, b: UiUser) => {
		const oa = order(a.status);
		const ob = order(b.status);
		if (oa !== ob) return oa - ob;
		return a.name.localeCompare(b.name);
	});

	return list;
};
