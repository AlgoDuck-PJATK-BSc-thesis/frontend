import type { UserLeaderboardEntryDto } from '$lib/api/user';

export type BgSegment = { src: string; top: number; h: number };

export type LeaderboardPage = {
	entries: UserLeaderboardEntryDto[];
	totalUsers: number;
	page: number;
};

export type LeaderboardItem = UserLeaderboardEntryDto & {
	rank: number;
	username: string;
	avatarKey: string;
	points: number;
};

export type TopUser = LeaderboardItem & { avatarPath: string };
