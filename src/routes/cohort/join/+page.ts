import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    const userCohort: string | null | undefined = null;

    if (!userCohort ||
        userCohort === 'undefined' ||
        userCohort === '' ||
        userCohort === null) {
        return {};
    }

    throw redirect(302, `/cohort/${userCohort}?view=chat`);
};