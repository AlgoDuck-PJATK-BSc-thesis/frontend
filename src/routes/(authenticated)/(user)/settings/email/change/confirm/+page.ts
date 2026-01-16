import type { PageLoad } from './$types';

const pick = (sp: URLSearchParams, keys: string[]) => {
	for (const k of keys) {
		const v = sp.get(k);
		if (v != null && v.trim()) return v.trim();
	}
	return '';
};

export const load: PageLoad = async ({ url }) => {
	const sp = url.searchParams;

	const userId = pick(sp, ['userId', 'UserId', 'userid', 'uid', 'u']);
	const newEmail = pick(sp, ['newEmail', 'NewEmail', 'new_email', 'email', 'Email', 'e']);
	const token = pick(sp, ['token', 'Token', 't']);

	return { userId, newEmail, token };
};
