import type { LeaderboardItem, LeaderboardPage, TopUser } from './types';
import type { UserLeaderboardEntryDto } from '$lib/api/user';

export const normalizeToCloudfrontKey = (value: string): string => {
	const v = (value ?? '').toString().trim();
	if (!v) return '';
	if (v.startsWith('http://') || v.startsWith('https://')) {
		try {
			const u = new URL(v);
			const p = (u.pathname ?? '').replace(/^\/+/, '').trim();
			return p || '';
		} catch {
			return '';
		}
	}
	return v;
};

export const toItems = (
	pages: LeaderboardPage[],
	myUserId: string,
	myAvatarOverrideKey: string,
	defaultAvatar: string
): LeaderboardItem[] => {
	const flat: UserLeaderboardEntryDto[] = pages.flatMap((p) => p.entries ?? []);
	return flat.map((u: UserLeaderboardEntryDto, idx: number) => {
		const raw = ((u as any)?.userAvatarUrl ?? '').toString();
		const keyFromApi = normalizeToCloudfrontKey(raw);
		const uid = ((u as any)?.userId ?? '').toString();
		const avatarKey =
			myUserId && uid === myUserId && myAvatarOverrideKey
				? myAvatarOverrideKey
				: keyFromApi || defaultAvatar;
		const rank = typeof (u as any)?.rank === 'number' ? ((u as any).rank as number) : idx + 1;
		const username = ((u as any)?.username ?? (u as any)?.userName ?? '').toString();
		const points = Number((u as any)?.experience ?? (u as any)?.xp ?? (u as any)?.points ?? 0);
		return { ...(u as any), rank, username, avatarKey, points } as LeaderboardItem;
	});
};

export const topThree = (items: LeaderboardItem[]): TopUser[] => {
	return items.slice(0, 3).map((u) => ({ ...u, avatarPath: u.avatarKey }));
};
