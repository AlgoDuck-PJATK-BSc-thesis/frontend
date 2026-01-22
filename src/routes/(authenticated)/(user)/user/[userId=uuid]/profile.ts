import { authApi } from '$lib/api/auth';
import { cohortApi, type CohortDetailsDto } from '$lib/api/cohort';
import {
	userApi,
	type UserAchievementDto,
	type UserDto,
	type UserStatisticsDto,
	type UserLeaderboardEntryDto
} from '$lib/api/user';

type AnyRecord = Record<string, unknown>;

const str = (v: unknown) => (v ?? '').toString();

const trim = (v: unknown) => str(v).trim();

export const getCohortId = (user: UserDto | null, stats: UserStatisticsDto | null) => {
	const s = stats as unknown as AnyRecord | null;
	const u = user as unknown as AnyRecord | null;
	const id = trim((s as any)?.cohortId ?? (u as any)?.cohortId ?? '');
	return id;
};

export const pickAvatarPath = (
	user: UserDto | null,
	stats: UserStatisticsDto | null,
	avatarOverride: string,
	defaultAvatar: string
) => {
	const override = trim(avatarOverride);
	if (override) return override;

	const u = user as unknown as AnyRecord | null;
	const s = stats as unknown as AnyRecord | null;

	const candidates: string[] = [
		typeof (u as any)?.userAvatarUrl === 'string' ? (u as any).userAvatarUrl : '',
		typeof (u as any)?.avatarUrl === 'string' ? (u as any).avatarUrl : '',
		typeof (u as any)?.selectedAvatarUrl === 'string' ? (u as any).selectedAvatarUrl : '',
		typeof (u as any)?.selectedDuckUrl === 'string' ? (u as any).selectedDuckUrl : '',
		typeof (u as any)?.selectedDuckPath === 'string' ? (u as any).selectedDuckPath : '',
		typeof (s as any)?.userAvatarUrl === 'string' ? (s as any).userAvatarUrl : '',
		typeof (s as any)?.avatarUrl === 'string' ? (s as any).avatarUrl : '',
		typeof (s as any)?.selectedAvatarUrl === 'string' ? (s as any).selectedAvatarUrl : '',
		typeof (s as any)?.selectedDuckUrl === 'string' ? (s as any).selectedDuckUrl : '',
		typeof (s as any)?.selectedDuckPath === 'string' ? (s as any).selectedDuckPath : ''
	];

	const picked = candidates.map((x) => trim(x)).find((x) => x.length > 0);
	return picked ?? defaultAvatar;
};

export const achievementName = (a: UserAchievementDto) =>
	trim((a as any)?.name ?? (a as any)?.title ?? '') || 'Achievement';

export const achievementDesc = (a: UserAchievementDto) => trim((a as any)?.description ?? '');

export type LoadedProfile = {
	meId: string;
	resolvedUserId: string;
	isMe: boolean;
	user: UserDto | null;
	stats: UserStatisticsDto | null;
	achievements: UserAchievementDto[];
	avatarOverride: string;
	myCohortId: string;
	cohortDetails: CohortDetailsDto | null;
	cohortError: string;
};

export const loadProfile = async (
	userIdParam: string,
	defaultAvatar: string,
	fetchFn: typeof fetch
): Promise<LoadedProfile> => {
	let meId = '';
	try {
		const me = await authApi.me();
		meId = trim((me as any)?.id ?? '');
	} catch {}

	let resolvedUserId = '';
	let isMe = false;

	if (trim(userIdParam) === 'me') {
		isMe = true;
		resolvedUserId = meId;
	} else {
		resolvedUserId = trim(userIdParam);
		isMe = !!meId && meId === resolvedUserId;
	}

	if (!resolvedUserId) {
		return {
			meId,
			resolvedUserId: '',
			isMe: false,
			user: null,
			stats: null,
			achievements: [],
			avatarOverride: '',
			myCohortId: '',
			cohortDetails: null,
			cohortError: ''
		};
	}

	let user: UserDto | null = null;
	let stats: UserStatisticsDto | null = null;
	let achievements: UserAchievementDto[] = [];

	try {
		const [u, s, a] = await Promise.all([
			userApi.getUserById(resolvedUserId),
			userApi.getUserStatisticsById(resolvedUserId),
			userApi.getUserAchievementsById(resolvedUserId)
		]);
		user = u ?? null;
		stats = s ?? null;
		achievements = (a ?? []) as UserAchievementDto[];
	} catch {
		user = null;
		stats = null;
		achievements = [];
	}

	let myCohortId = '';
	if (meId) {
		if (isMe) {
			myCohortId = getCohortId(user, stats);
		} else {
			try {
				const myStats = await userApi.getUserStatisticsById(meId);
				myCohortId = trim((myStats as any)?.cohortId ?? '');
			} catch {
				myCohortId = '';
			}
		}
	}

	let avatarOverride = '';
	const initialAvatar = pickAvatarPath(user, stats, '', defaultAvatar);
	if (trim(initialAvatar) === trim(defaultAvatar)) {
		try {
			const all = await userApi.getGlobalLeaderboardAll(fetchFn);
			const hit = all.find(
				(x: UserLeaderboardEntryDto) => trim((x as any)?.userId) === resolvedUserId
			);
			const url = trim((hit as any)?.userAvatarUrl ?? '');
			if (url) avatarOverride = url;
		} catch {}
	}

	let cohortDetails: CohortDetailsDto | null = null;
	let cohortError = '';
	const cohortId = getCohortId(user, stats);

	if (cohortId) {
		try {
			cohortDetails = await cohortApi.getById(cohortId, fetchFn);
		} catch (e) {
			cohortError = e instanceof Error ? e.message : 'Failed to load cohort.';
			cohortDetails = null;
		}
	}

	return {
		meId,
		resolvedUserId,
		isMe,
		user,
		stats,
		achievements,
		avatarOverride,
		myCohortId,
		cohortDetails,
		cohortError
	};
};
