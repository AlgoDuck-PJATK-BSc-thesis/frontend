import { userApi, type UserLeaderboardEntryDto } from '$lib/api/user';
import type { LeaderboardPage } from './types';

export const pageSize = 40;

export const fetchLeaderboardPage = async (page: number): Promise<LeaderboardPage> => {
	const ua = userApi as any;

	if (typeof ua.getGlobalLeaderboard === 'function') {
		try {
			const r = await ua.getGlobalLeaderboard(page, pageSize);
			const entries = (r?.entries ?? r?.items ?? []) as UserLeaderboardEntryDto[];
			const totalUsers = Number(r?.totalUsers ?? r?.totalItems ?? entries.length);
			return { entries, totalUsers, page };
		} catch {}

		try {
			const r = await ua.getGlobalLeaderboard(fetch, page, pageSize);
			const entries = (r?.entries ?? r?.items ?? []) as UserLeaderboardEntryDto[];
			const totalUsers = Number(r?.totalUsers ?? r?.totalItems ?? entries.length);
			return { entries, totalUsers, page };
		} catch {}

		try {
			const r = await ua.getGlobalLeaderboard(page + 1, pageSize);
			const entries = (r?.entries ?? r?.items ?? []) as UserLeaderboardEntryDto[];
			const totalUsers = Number(r?.totalUsers ?? r?.totalItems ?? entries.length);
			return { entries, totalUsers, page };
		} catch {}
	}

	const all = (await userApi.getGlobalLeaderboardAll()) as UserLeaderboardEntryDto[];
	const start = page * pageSize;
	const entries = all.slice(start, start + pageSize);
	return { entries, totalUsers: all.length, page };
};
