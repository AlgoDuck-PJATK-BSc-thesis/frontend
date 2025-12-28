import { FetchFromApi, FetchJsonFromApi } from '$lib/api/apiCall';

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

export type UserDto = {
	userId?: string;
	username?: string;
	experience?: number;
	amountSolved?: number;
	coins?: number;
	cohortId?: string | null;
	userAvatarUrl?: string | null;
};

export type UserStatisticsDto = {
	experience?: number;
	coins?: number;
	amountSolved?: number;
	totalSubmissions?: number;
	acceptanceRate?: number;
	accepted?: number;
	wrongAnswer?: number;
	timeLimitExceeded?: number;
	runtimeError?: number;
	avgAttemptsPerSolved?: number;
};

export type UserAchievementDto = {
	achievementId?: string;
	name?: string;
	title?: string;
	description?: string;
	unlockedAt?: string;
};

export type UserRankingsDto = {
	globalRank?: number | null;
	cohortRank?: number | null;
	cohortId?: string | null;
};

export type UserLeaderboardPositionDto = {
	globalRank?: number | null;
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
	},

	getMe: async (fetcher?: typeof fetch): Promise<UserDto> => {
		const res = await FetchFromApi<UserDto>('user/me', { method: 'GET' }, fetcher);
		return res.body;
	},

	getMyStatistics: async (fetcher?: typeof fetch): Promise<UserStatisticsDto> => {
		const res = await FetchFromApi<UserStatisticsDto>(
			'user/statistics',
			{ method: 'GET' },
			fetcher
		);
		return res.body;
	},

	getUserById: async (userId: string, fetcher?: typeof fetch): Promise<UserDto> => {
		const res = await FetchFromApi<UserDto>(`user/${userId}`, { method: 'GET' }, fetcher);
		return res.body;
	},

	getUserStatisticsById: async (
		userId: string,
		fetcher?: typeof fetch
	): Promise<UserStatisticsDto> => {
		const res = await FetchFromApi<UserStatisticsDto>(
			`user/${userId}/statistics`,
			{ method: 'GET' },
			fetcher
		);
		return res.body;
	},

	getUserAchievementsById: async (
		userId: string,
		request?: Record<string, string | number | boolean | null | undefined>,
		fetcher?: typeof fetch
	): Promise<UserAchievementDto[]> => {
		const sp = new URLSearchParams();
		if (request) {
			for (const [k, v] of Object.entries(request)) {
				if (v === undefined || v === null) continue;
				sp.set(k, String(v));
			}
		}

		const res = await FetchFromApi<UserAchievementDto[]>(
			`user/${userId}/achievements`,
			{ method: 'GET' },
			fetcher,
			sp
		);
		return res.body;
	},

	getUserRankings: async (
		query: Record<string, string | number | boolean | null | undefined>,
		fetcher?: typeof fetch
	): Promise<UserRankingsDto> => {
		const sp = new URLSearchParams();
		for (const [k, v] of Object.entries(query)) {
			if (v === undefined || v === null) continue;
			sp.set(k, String(v));
		}

		return await FetchJsonFromApi<UserRankingsDto>('user/rankings', { method: 'GET' }, fetcher, sp);
	},

	getMyLeaderboardPosition: async (fetcher?: typeof fetch): Promise<UserLeaderboardPositionDto> => {
		return await FetchJsonFromApi<UserLeaderboardPositionDto>(
			'user/leaderboard/me',
			{ method: 'GET' },
			fetcher
		);
	}
};
