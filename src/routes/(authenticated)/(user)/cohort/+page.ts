import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { cohortApi } from '$lib/api/cohort';

export const load: PageLoad = async ({ fetch }) => {
	const current = await cohortApi.getCurrent(fetch).catch(() => null);
	if (!current) throw redirect(302, '/cohort/join');
	throw redirect(302, `/cohort/${current.cohortId}/chat`);
};
