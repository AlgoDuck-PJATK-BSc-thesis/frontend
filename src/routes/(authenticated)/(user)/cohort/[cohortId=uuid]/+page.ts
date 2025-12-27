import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	throw redirect(302, `/cohort/${params.cohortId}/chat`);
};
