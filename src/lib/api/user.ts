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
	}
};
