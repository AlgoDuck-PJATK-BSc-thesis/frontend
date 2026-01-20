import { FetchFromApi } from '$lib/api/apiCall';

export type UserProfileDto = {
	userId: string;
	username: string;
	email: string;
	coins: number;
	experience: number;
	amountSolved: number;
	cohortId: string | null;
	language: string;
	s3AvatarUrl: string;
	twoFactorEnabled: boolean;
	emailConfirmed: boolean;
};

export type GetUserProfileDtoResult = {
	profile: UserProfileDto;
	roles: string[];
	primaryRole: string | null;
};

export const profileApi = {
	getProfile: async (fetcher?: typeof fetch): Promise<GetUserProfileDtoResult> => {
		const res = await FetchFromApi<GetUserProfileDtoResult>('user/profile', { method: 'GET' }, fetcher);
		return res.body;
	}
};