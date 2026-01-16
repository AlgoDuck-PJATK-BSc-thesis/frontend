import { PUBLIC_API_URL } from '$env/static/public';
import { json, type RequestHandler } from '@sveltejs/kit';

type Reminder = {
	day: string;
	enabled: boolean;
	hour: number;
	minute: number;
};

type UserConfigDto = {
	isDarkMode: boolean;
	isHighContrast: boolean;
	emailNotificationsEnabled: boolean;
	username: string;
	email: string;
	weeklyReminders: Reminder[];
	s3AvatarUrl: string;
};

type UpdatePreferencesDto = {
	isDarkMode: boolean;
	isHighContrast: boolean;
	emailNotificationsEnabled: boolean;
	weeklyReminders: Reminder[] | null;
};

const normalizeApiOrigin = (v: string) => {
	const s = (v ?? '').trim().replace(/\/+$/, '');
	return s.endsWith('/api') ? s.slice(0, -4) : s;
};

const apiOrigin = normalizeApiOrigin(PUBLIC_API_URL ?? '');

const getCookie = (cookieHeader: string, name: string) => {
	const parts = `; ${cookieHeader}`.split(`; ${name}=`);
	if (parts.length < 2) return null;
	const raw = parts.pop()?.split(';')[0] ?? null;
	return raw ? decodeURIComponent(raw) : null;
};

const unwrapBody = (v: unknown) => {
	if (!v || typeof v !== 'object') return v;
	const o = v as Record<string, unknown>;
	if ('body' in o) return o.body;
	return v;
};

const backendFetch = async (
	event: Parameters<RequestHandler>[0],
	path: string,
	init: RequestInit
) => {
	if (!apiOrigin) {
		return new Response('Missing PUBLIC_API_URL.', { status: 500 });
	}

	const url = new URL(`${apiOrigin}/api/${path.replace(/^\/+/, '')}`);

	const incomingCookie = event.request.headers.get('cookie') ?? '';
	const csrf = getCookie(incomingCookie, 'csrf_token');

	const headers = new Headers(init.headers ?? {});
	if (!headers.has('Accept')) headers.set('Accept', 'application/json');
	if (incomingCookie && !headers.has('Cookie')) headers.set('Cookie', incomingCookie);
	if (csrf && !headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', csrf);

	return await fetch(url.toString(), { ...init, headers });
};

const getCurrentConfig = async (event: Parameters<RequestHandler>[0]) => {
	const res = await backendFetch(event, 'user/config', { method: 'GET' });

	const parsed = await res.json().catch(() => null);

	if (!res.ok) {
		return { ok: false as const, status: res.status, payload: parsed };
	}

	const body = unwrapBody(parsed) as UserConfigDto;
	return { ok: true as const, status: 200, payload: body };
};

const toUpdatePreferencesDto = (current: UserConfigDto, patch: Partial<UserConfigDto>) => {
	const dto: UpdatePreferencesDto = {
		isDarkMode: typeof patch.isDarkMode === 'boolean' ? patch.isDarkMode : !!current.isDarkMode,
		isHighContrast:
			typeof patch.isHighContrast === 'boolean' ? patch.isHighContrast : !!current.isHighContrast,
		emailNotificationsEnabled:
			typeof patch.emailNotificationsEnabled === 'boolean'
				? patch.emailNotificationsEnabled
				: !!current.emailNotificationsEnabled,
		weeklyReminders:
			'weeklyReminders' in patch
				? (patch.weeklyReminders ?? null)
				: (current.weeklyReminders ?? null)
	};

	return dto;
};

export const GET: RequestHandler = async (event) => {
	const curr = await getCurrentConfig(event);
	if (!curr.ok) return json(curr.payload ?? null, { status: curr.status });
	return json(curr.payload);
};

export const PATCH: RequestHandler = async (event) => {
	const curr = await getCurrentConfig(event);
	if (!curr.ok) return json(curr.payload ?? null, { status: curr.status });

	const patch = (await event.request.json().catch(() => ({}))) as Partial<UserConfigDto>;
	const dto = toUpdatePreferencesDto(curr.payload, patch);

	const save = await backendFetch(event, 'user/preferences', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(dto)
	});

	if (!save.ok) {
		const err = await save.json().catch(() => null);
		return json(err ?? null, { status: save.status });
	}

	const next = await getCurrentConfig(event);
	if (!next.ok) return json(next.payload ?? null, { status: next.status });
	return json(next.payload);
};

export const PUT: RequestHandler = async (event) => {
	const curr = await getCurrentConfig(event);
	if (!curr.ok) return json(curr.payload ?? null, { status: curr.status });

	const body = (await event.request.json().catch(() => ({}))) as Partial<UserConfigDto>;
	const dto = toUpdatePreferencesDto(curr.payload, body);

	const save = await backendFetch(event, 'user/preferences', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(dto)
	});

	if (!save.ok) {
		const err = await save.json().catch(() => null);
		return json(err ?? null, { status: save.status });
	}

	const next = await getCurrentConfig(event);
	if (!next.ok) return json(next.payload ?? null, { status: next.status });
	return json(next.payload);
};
