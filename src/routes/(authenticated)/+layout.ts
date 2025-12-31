import { redirect } from '@sveltejs/kit';
import { authApi } from '$lib/api/auth';
import { profileApi } from '$lib/api/profile';

export const ssr = false;

type LoadEventLike = {
	fetch: typeof fetch;
	url: URL;
};

const normalizeRole = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

export const load = async ({ fetch, url }: LoadEventLike) => {
	try {
		const user = await authApi.me(fetch);

		const profileResult = await profileApi.getProfile(fetch).catch(() => ({
			profile: null,
			roles: [],
			primaryRole: null
		}));

		const roles = (profileResult.roles ?? []).map((r) => normalizeRole(r)).filter(Boolean);
		const primaryRole = normalizeRole(profileResult.primaryRole);

		const isAdmin = roles.includes('admin') || primaryRole === 'admin';

		return {
			user,
			profileResult,
			roles,
			primaryRole,
			isAdmin
		};
	} catch {
		throw redirect(302, `/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	}
};
