import { requireApiUrl } from '$lib/config/publicUrls';

type Provider = 'google' | 'github' | 'microsoft';

function safeRelative(value: string | null | undefined, fallback: string) {
	const v = (value ?? '').trim();
	if (!v.startsWith('/')) return fallback;
	if (v.startsWith('//')) return fallback;
	return v;
}

function stripTrailingSlash(v: string) {
	return v.endsWith('/') ? v.slice(0, -1) : v;
}

function normalizeApiOrigin(v: string) {
	const s = stripTrailingSlash(v);
	return s.endsWith('/api') ? s.slice(0, -4) : s;
}

export function buildOAuthStartUrl(
	provider: Provider,
	returnUrl?: string,
	errorUrl?: string,
	opts?: { prompt?: 'select_account' | 'login' }
) {
	const apiOrigin = normalizeApiOrigin(requireApiUrl());
	const r = safeRelative(returnUrl, '/home');
	const e = safeRelative(errorUrl, '/login');

	const url = new URL(`${apiOrigin}/api/auth/oauth/${provider}/start`);
	url.searchParams.set('returnUrl', r);
	url.searchParams.set('errorUrl', e);

	const prompt = opts?.prompt ?? (provider === 'microsoft' ? 'select_account' : undefined);
	if (prompt) {
		url.searchParams.set('prompt', prompt);
	}

	return url.toString();
}

export function redirectToOAuth(
	provider: Provider,
	returnUrl?: string,
	errorUrl?: string,
	opts?: { prompt?: 'select_account' | 'login' }
) {
	window.location.href = buildOAuthStartUrl(provider, returnUrl, errorUrl, opts);
}
