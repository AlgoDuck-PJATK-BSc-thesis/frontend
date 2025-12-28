import { FetchFromApi } from '$lib/api/apiCall';

export type UserLeaderboardEntryDto = {
	rank: number;
	userId: string;
	username: string;
	experience: number;
	amountSolved: number;
	cohortId: string | null;
	userAvatarUrl: string | null;
};

export type UserLeaderboardPageDto = {
	page: number;
	pageSize: number;
	totalUsers: number;
	entries: UserLeaderboardEntryDto[];
};

export const userApi = {
	getCohortLeaderboard: async (
		cohortId: string,
		page = 1,
		pageSize = 20,
		fetcher?: typeof fetch
	): Promise<UserLeaderboardPageDto> => {
		const sp = new URLSearchParams();
		sp.set('cohortId', cohortId);
		sp.set('page', String(page));
		sp.set('pageSize', String(pageSize));

		const res = await FetchFromApi<UserLeaderboardPageDto>(
			'leaderboard/cohort',
			{ method: 'GET' },
			fetcher,
			sp
		);
		return res.body;
	},

	getGlobalLeaderboard: async (
		page = 1,
		pageSize = 20,
		fetcher?: typeof fetch
	): Promise<UserLeaderboardPageDto> => {
		const sp = new URLSearchParams();
		sp.set('page', String(page));
		sp.set('pageSize', String(pageSize));

		const res = await FetchFromApi<UserLeaderboardPageDto>(
			'leaderboard/global',
			{ method: 'GET' },
			fetcher,
			sp
		);
		return res.body;
	},

	getGlobalLeaderboardAll: async (fetcher?: typeof fetch): Promise<UserLeaderboardEntryDto[]> => {
		const pageSize = 100;
		let page = 1;

		let totalUsers: number | null = null;
		const out: UserLeaderboardEntryDto[] = [];

		while (true) {
			const res = await userApi.getGlobalLeaderboard(page, pageSize, fetcher);

			if (totalUsers === null) totalUsers = res.totalUsers ?? null;

			const batch = res.entries ?? [];
			out.push(...batch);

			if (batch.length === 0) break;
			if (totalUsers !== null && out.length >= totalUsers) break;

			page += 1;
			if (page > 200) break;
		}

		return out;
	}
};
