import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { cohortApi } from '$lib/api/cohort';

export const load: LayoutLoad = async ({ params, url, fetch }) => {
	const current = await cohortApi.getCurrent(fetch).catch(() => null);
	if (!current) throw redirect(302, '/cohort/join');

	const paramId = params.cohortId;
	if (paramId !== current.cohortId) {
		const dest = url.pathname.includes('/leaderboard') ? 'leaderboard' : 'chat';
		throw redirect(302, `/cohort/${current.cohortId}/${dest}`);
	}

	const [members, activeMembers] = await Promise.all([
		cohortApi.getAllMembers(current.cohortId, fetch).catch(() => []),
		cohortApi.getActiveMembers(current.cohortId, fetch).catch(() => [])
	]);

	return {
		cohort: current,
		members,
		activeMembers
	};
};
