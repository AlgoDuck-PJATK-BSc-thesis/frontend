import type { HandleFetch } from '@sveltejs/kit';
import { userApi } from '$lib/api/user';

const COINS_STORAGE_KEY = 'algoduck:coins';

let currentCoins: number | null = null;
let refreshRunning = false;
let refreshQueued = false;
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

const tryParseJsonCoins = async (res: Response): Promise<boolean> => {
	const ct = res.headers.get('content-type') ?? '';
	if (!ct.includes('application/json')) return false;

	try {
		const data = await res.clone().json();
		const maybeCoins = extractCoins(data);
		if (maybeCoins !== undefined) {
			setClientCoins(maybeCoins);
			return true;
		}
	} catch {}

	return false;
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

	if (!url.pathname.includes('/api/')) return false;

	const p = url.pathname.toLowerCase();
	if (
		p.includes('mystatistics') ||
		p.includes('getmystatistics') ||
		p.includes('/me') ||
		p.includes('getme')
	)
		return false;

	return true;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const pullCoinsFromServer = async (fetchFn: typeof fetch): Promise<number | null> => {
	try {
		const s = await userApi.getMyStatistics(fetchFn);
		const c = (s as unknown as { coins?: unknown })?.coins;
		const n = coerceNumber(c);
		if (n !== null) return n;
	} catch {}

	try {
		const me = await userApi.getMe(fetchFn);
		const c = (me as unknown as { coins?: unknown })?.coins;
		const n = coerceNumber(c);
		if (n !== null) return n;
	} catch {}

	return null;
};

const refreshUntilChanged = async (fetchFn: typeof fetch) => {
	readCurrentCoins();
	const baseline = currentCoins;

	const delays = [
		0, 150, 250, 400, 650, 900, 1200, 1600, 2200, 3000, 4000, 5500, 7000, 8500, 10000
	];

	for (const d of delays) {
		if (d > 0) await sleep(d);
		const n = await pullCoinsFromServer(fetchFn);
		if (n === null) continue;
		if (baseline === null || n !== baseline) {
			setClientCoins(n);
			return;
		}
	}

	const finalN = await pullCoinsFromServer(fetchFn);
	if (finalN !== null) setClientCoins(finalN);
};

const queueRefresh = (fetchFn: typeof fetch) => {
	const f = baseFetch ?? fetchFn;

	if (refreshRunning) {
		refreshQueued = true;
		return;
	}

	refreshRunning = true;
	refreshQueued = false;

	(async () => {
		try {
			await refreshUntilChanged(f);
		} finally {
			refreshRunning = false;
			if (refreshQueued) queueRefresh(fetchFn);
		}
	})();
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
