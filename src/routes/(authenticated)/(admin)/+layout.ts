import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ parent, url }) => {
	const data = await parent();

	const isAdmin = !!data.isAdmin;

	if (!isAdmin) {
		throw redirect(302, `/home?next=${encodeURIComponent(url.pathname + url.search)}`);
	}

	return {};
};