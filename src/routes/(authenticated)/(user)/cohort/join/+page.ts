import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { DuckDto } from '../../Shop/Dtos';
import { loadDucks } from '../../Shop/loadDucks';

export const load: PageLoad = async () => {
	const userCohort: string | null | undefined = null;

	if (userCohort && userCohort !== 'undefined' && userCohort !== '') {
		throw redirect(302, `/cohort/${userCohort}?view=chat`);
	}

	const ducks: DuckDto[] = await loadDucks();
	return { ducks };
};
