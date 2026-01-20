import type { PageLoad } from './$types';

const pick = (sp: URLSearchParams, keys: string[]) => {
	for (const k of keys) {
		const v = sp.get(k);
		if (v != null && v.trim()) return v.trim();
	}
	return '';
};

const normalizeTokenFromQuery = (raw: string) => {
	const t = (raw ?? '').toString().trim();
	if (!t) return '';
	return t.replaceAll(' ', '+');
};

export const load: PageLoad = async ({ url }) => {
	const sp = url.searchParams;

	const userId = pick(sp, ['userId', 'UserId', 'userid', 'uid', 'u']);
	const newEmail = pick(sp, ['newEmail', 'NewEmail', 'new_email', 'email', 'Email', 'e']);
	const tokenRaw = pick(sp, ['token', 'Token', 't']);

	const token = normalizeTokenFromQuery(tokenRaw);

	return { userId, newEmail, token };
};
