import { redirect } from '@sveltejs/kit';
import { authApi, type AuthUserDto } from '$lib/api/auth';
import { UserData } from '$lib/stores/userData.svelte';

export const ssr = false;

type LoadEventLike = {
	fetch: typeof fetch;
	url: URL;
};

export const load = async ({ fetch, url }: LoadEventLike) => {
	try {
		const user = await authApi.me(fetch);
		return { user };
	} catch {
		throw redirect(302, `/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	}
};
