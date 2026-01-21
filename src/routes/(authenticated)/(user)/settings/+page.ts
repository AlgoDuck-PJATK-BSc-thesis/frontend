import type { PageLoad } from './$types';
import { settingsApi } from '$lib/api/settings';

export const ssr = false;
export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	try {
		const settings = await settingsApi.getUserConfig(fetch);
		return { settings };
	} catch {
		return { settings: null };
	}
};
