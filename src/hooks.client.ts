import type { HandleFetch } from '@sveltejs/kit';
import { userApi } from '$lib/api/user';

const COINS_STORAGE_KEY = 'algoduck:coins';

const REFRESH_COOLDOWN_MS = 20000;
const REFRESH_RETRY_DELAYS_MS = [0, 1200, 3500];

let currentCoins: number | null = null;

let refreshPromise: Promise<void> | null = null;
let refreshQueued = false;
let lastRefreshStartedAt = 0;
let refreshCooldownTimer: ReturnType<typeof setTimeout> | null = null;

let fetchPatched = false;
let baseFetch: typeof fetch | null = null;

const seenResponses = new WeakSet<Response>();

const coerceNumber = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const s = value.trim();
		if (!s) return null;
		const n = Number(s);
		if (Number.isFinite(n)) return n;
	}
	return null;
};

const readCurrentCoins = () => {
	if (typeof window === 'undefined') return;
	if (currentCoins !== null) return;
	try {
		const raw = window.localStorage.getItem(COINS_STORAGE_KEY);
		const n = coerceNumber(raw);
		if (n !== null) currentCoins = n;
	} catch {}
};

const setClientCoins = (value: unknown) => {
	const n = coerceNumber(value);
	if (n === null) return;
	readCurrentCoins();
	currentCoins = n;

	try {
		window.localStorage.setItem(COINS_STORAGE_KEY, String(n));
	} catch {}

	try {
		window.dispatchEvent(new CustomEvent('algoduck:coins', { detail: n }));
	} catch {}
};

const extractCoins = (data: any): unknown => {
	return (
		data?.coins ?? data?.user?.coins ?? data?.me?.coins ?? data?.data?.coins ?? data?.result?.coins
	);
};

const safeReadJson = async (res: Response): Promise<any | null> => {
	const ct = res.headers.get('content-type') ?? '';
	if (!ct.includes('application/json')) return null;
	try {
		return await res.clone().json();
	} catch {
		return null;
	}
};

const tryParseJsonCoins = async (res: Response): Promise<boolean> => {
	const data = await safeReadJson(res);
	if (data == null) return false;

	const maybeCoins = extractCoins(data);
	if (maybeCoins === undefined) return false;

	setClientCoins(maybeCoins);
	return true;
};

const getErrorStatus = (e: unknown): number | null => {
	if (!e || typeof e !== 'object') return null;
	const anyE = e as any;
	if (typeof anyE.status === 'number') return anyE.status;
	if (typeof anyE?.response?.status === 'number') return anyE.response.status;
	return null;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const pullCoinsFromServer = async (fetchFn: typeof fetch): Promise<number | null> => {
	try {
		const s = await userApi.getMyStatistics(fetchFn);
		const c = (s as unknown as { coins?: unknown })?.coins;
		const n = coerceNumber(c);
		if (n !== null) return n;
	} catch (e) {
		const st = getErrorStatus(e);
		if (st === 401 || st === 403 || st === 429) return null;
	}

	try {
		const me = await userApi.getMe(fetchFn);
		const c = (me as unknown as { coins?: unknown })?.coins;
		const n = coerceNumber(c);
		if (n !== null) return n;
	} catch {}

	return null;
};

const shouldKickRefresh = (req: Request, res: Response) => {
	if (!res.ok) return false;

	const method = (req.method || 'GET').toUpperCase();
	if (method === 'GET') return false;

	let url: URL;
	try {
		url = new URL(req.url);
	} catch {
		return false;
	}

	const p = url.pathname.toLowerCase();
	if (!p.includes('/api/')) return false;

	if (p.startsWith('/api/user/')) return false;
	if (p.startsWith('/api/auth/')) return false;
	if (p.startsWith('/api/leaderboard/')) return false;

	return true;
};

const scheduleAfterCooldown = (fetchFn: typeof fetch) => {
	const now = Date.now();
	const remaining = REFRESH_COOLDOWN_MS - (now - lastRefreshStartedAt);

	if (remaining <= 0) {
		queueRefresh(fetchFn);
		return;
	}

	if (refreshCooldownTimer) return;

	refreshCooldownTimer = setTimeout(() => {
		refreshCooldownTimer = null;
		queueRefresh(fetchFn);
	}, remaining);
};

const runRefresh = async (fetchFn: typeof fetch) => {
	readCurrentCoins();
	const baseline = currentCoins;

	for (let i = 0; i < REFRESH_RETRY_DELAYS_MS.length; i += 1) {
		const d = REFRESH_RETRY_DELAYS_MS[i];
		if (d > 0) await sleep(d);

		const n = await pullCoinsFromServer(fetchFn);
		if (n === null) continue;

		if (baseline === null) {
			setClientCoins(n);
			return;
		}

		if (n !== baseline) {
			setClientCoins(n);
			return;
		}

		if (i === REFRESH_RETRY_DELAYS_MS.length - 1) {
			setClientCoins(n);
			return;
		}
	}
};

const queueRefresh = (fetchFn: typeof fetch) => {
	const f = baseFetch ?? fetchFn;
	const now = Date.now();

	if (refreshPromise) {
		refreshQueued = true;
		return;
	}

	if (now - lastRefreshStartedAt < REFRESH_COOLDOWN_MS) {
		refreshQueued = true;
		scheduleAfterCooldown(fetchFn);
		return;
	}

	lastRefreshStartedAt = now;
	refreshQueued = false;

	refreshPromise = runRefresh(f).finally(() => {
		refreshPromise = null;
		if (refreshQueued) {
			refreshQueued = false;
			scheduleAfterCooldown(fetchFn);
		}
	});
};

const instrument = async (req: Request, res: Response, fetchFnForRefresh: typeof fetch) => {
	if (seenResponses.has(res)) return;
	seenResponses.add(res);

	const hadCoins = await tryParseJsonCoins(res);
	if (!hadCoins && shouldKickRefresh(req, res)) queueRefresh(fetchFnForRefresh);
};

const patchGlobalFetch = () => {
	if (typeof window === 'undefined') return;
	if (fetchPatched) return;
	fetchPatched = true;

	const originalFetch = window.fetch.bind(window);
	baseFetch = originalFetch;

	window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const req = input instanceof Request ? input : new Request(input, init);
		const res = await originalFetch(input as any, init);
		void instrument(req, res, originalFetch);
		return res;
	};
};

patchGlobalFetch();

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	const res = await fetch(request);
	void instrument(request, res, fetch);
	return res;
};
