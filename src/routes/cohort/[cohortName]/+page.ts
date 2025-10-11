import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => {
	const cohortName = params.cohortName;
	const userCohort = cohortName;
	const view = url.searchParams.get('view');

	if (
		!userCohort ||
		!cohortName ||
		cohortName === 'undefined' ||
		cohortName !== userCohort ||
		userCohort === '' ||
		userCohort === null
	) {
		throw redirect(302, '/cohort/join');
	}

	if (!view) {
		throw redirect(302, `/cohort/${cohortName}?view=chat`);
	}

	if (view !== 'chat' && view !== 'leaderboard') {
		throw redirect(302, `/cohort/${cohortName}/missing`);
	}

	return {};
};
