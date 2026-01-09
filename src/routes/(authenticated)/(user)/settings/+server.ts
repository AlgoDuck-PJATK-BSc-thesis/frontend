import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';

type DisplayLanguage = 'en' | 'pl';

type SettingsState = {
	profile: { username: string; email: string };
	security: { twoFactor: boolean };
	notifications: { email: boolean; push: boolean };
	preferences: { displayLanguage: DisplayLanguage };
};

const COOKIE_NAME = 'algoduck_settings_v1';

const defaultSettings: SettingsState = {
	profile: { username: '', email: '' },
	security: { twoFactor: false },
	notifications: { email: true, push: false },
	preferences: { displayLanguage: 'en' }
};

const isObj = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v);

const merge = <T>(base: T, patch: unknown): T => {
	if (!isObj(base) || !isObj(patch)) return base;
	const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
	for (const [k, v] of Object.entries(patch)) {
		const prev = out[k];
		if (isObj(prev) && isObj(v)) out[k] = merge(prev, v);
		else out[k] = v;
	}
	return out as T;
};

const clampSettings = (s: unknown): SettingsState => {
	const merged = merge(structuredClone(defaultSettings), s);
	const lang = merged.preferences.displayLanguage;
	merged.preferences.displayLanguage = lang === 'pl' ? 'pl' : 'en';
	merged.security.twoFactor = !!merged.security.twoFactor;
	merged.notifications.email = !!merged.notifications.email;
	merged.notifications.push = !!merged.notifications.push;
	merged.profile.username = String(merged.profile.username ?? '');
	merged.profile.email = String(merged.profile.email ?? '');
	return merged;
};

const readCookie = (cookieVal: string | undefined): SettingsState => {
	if (!cookieVal) return structuredClone(defaultSettings);
	try {
		return clampSettings(JSON.parse(cookieVal));
	} catch {
		return structuredClone(defaultSettings);
	}
};

const writeCookie = (cookies: Parameters<RequestHandler>[0]['cookies'], value: SettingsState) => {
	cookies.set(COOKIE_NAME, JSON.stringify(value), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: 60 * 60 * 24 * 365
	});
};

export const GET: RequestHandler = async ({ cookies }) => {
	const current = readCookie(cookies.get(COOKIE_NAME));
	return json(current);
};

export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const current = readCookie(cookies.get(COOKIE_NAME));
	const patch = await request.json().catch(() => ({}));
	const next = clampSettings(merge(current, patch));
	writeCookie(cookies, next);
	return json(next);
};

export const PUT: RequestHandler = async ({ cookies, request }) => {
	const body = await request.json().catch(() => ({}));
	const next = clampSettings(body);
	writeCookie(cookies, next);
	return json(next);
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete(COOKIE_NAME, { path: '/' });
	return json(structuredClone(defaultSettings));
};
