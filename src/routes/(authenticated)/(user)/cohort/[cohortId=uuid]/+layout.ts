import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { cohortApi } from '$lib/api/cohort';
import type { DuckDto } from '../../Shop/Dtos';
import { getDucksPaged } from '$lib/api/ducks';

export const load: LayoutLoad = async ({ params, url, fetch }) => {
	const current = await cohortApi.getCurrent(fetch).catch(() => null);
	if (!current) throw redirect(302, '/cohort/join');

	const paramId = params.cohortId;
	if (paramId !== current.cohortId) {
		const dest = url.pathname.includes('/leaderboard') ? 'leaderboard' : 'chat';
		throw redirect(302, `/cohort/${current.cohortId}/${dest}`);
	}

	const loadDuckIds = async (): Promise<DuckDto[]> => {
		const { ducks } = await getDucksPaged(fetch, 0, 50);
		return ducks.map((d) => ({ id: d.id }));
	};

	const [members, activeMembers, ducks] = await Promise.all([
		cohortApi.getAllMembers(current.cohortId, fetch).catch(() => []),
		cohortApi.getActiveMembers(current.cohortId, fetch).catch(() => []),
		loadDuckIds().catch(() => [] as DuckDto[])
	]);

	return {
		cohort: current,
		members,
		activeMembers,
		ducks
	};
};
