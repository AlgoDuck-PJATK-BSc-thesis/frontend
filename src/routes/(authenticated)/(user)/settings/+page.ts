import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/settings', { headers: { accept: 'application/json' } });
	if (!res.ok) return { settings: null };
	const settings = await res.json();
	return { settings };
};
