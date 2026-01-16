import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

type StandardResponseDto<T> = {
	status: string;
	message: string | null;
	body: T;
};

type UserConfigDto = {
	isDarkMode: boolean;
	isHighContrast: boolean;
	emailNotificationsEnabled: boolean;
	username: string;
	email: string;
	weeklyReminders: unknown[];
	s3AvatarUrl: string;
};

const stripTrailingSlash = (v: string) => (v.endsWith('/') ? v.slice(0, -1) : v);

const normalizeApiOrigin = (v: string) => {
	const s = stripTrailingSlash((v ?? '').trim());
	return s.endsWith('/api') ? s.slice(0, -4) : s;
};

export const load: PageServerLoad = async ({ fetch, request, locals }) => {
	const origin = normalizeApiOrigin(PUBLIC_API_URL ?? '');
	const apiBase = origin ? `${origin}/api` : '';

	let config: UserConfigDto | null = null;

	if (apiBase) {
		try {
			const res = await fetch(`${apiBase}/user/config`, {
				method: 'GET',
				headers: {
					accept: 'application/json',
					cookie: request.headers.get('cookie') ?? ''
				}
			});

			if (res.ok) {
				const parsed = (await res.json()) as StandardResponseDto<UserConfigDto>;
				config = parsed?.body ?? null;
			}
		} catch {
			config = null;
		}
	}

	const u = (locals as any)?.user ?? null;

	const user =
		u == null
			? null
			: {
					username: (u.username ?? u.userName ?? u.name ?? '') as string,
					email: (u.email ?? '') as string
				};

	return { config, user };
};
