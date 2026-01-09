import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { userApi } from '$lib/api/user';

const STORAGE_KEY = 'algoduck:coins';

const toNumber = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const n = Number(value.trim());
		if (Number.isFinite(n)) return n;
	}
	return null;
};

const extractCoins = (value: unknown): number | null => {
	const v: any = value as any;
	return (
		toNumber(v?.coins) ??
		toNumber(v?.body?.coins) ??
		toNumber(v?.profile?.coins) ??
		toNumber(v?.body?.profile?.coins) ??
		toNumber(v?.data?.coins) ??
		toNumber(v?.data?.profile?.coins) ??
		null
	);
};

const readStored = (): number | null => {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return toNumber(raw);
	} catch {
		return null;
	}
};

const writeStored = (n: number) => {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, String(n));
	} catch {}
};

export const coins = writable<number | null>(readStored());

export const setCoins = (value: unknown) => {
	const n = toNumber(value);
	if (n === null) return;
	coins.set(n);
	writeStored(n);
};

export const applyCoinsDelta = (delta: number) => {
	const current = get(coins) ?? 0;
	const next = current + delta;
	coins.set(next);
	writeStored(next);
};

let inFlight: Promise<void> | null = null;
let seq = 0;

export const refreshCoins = (fetcher?: typeof fetch) => {
	if (inFlight) return inFlight;
	const mySeq = ++seq;

	inFlight = (async () => {
		try {
			const stats = await userApi.getMyStatistics(fetcher);
			const c1 = extractCoins(stats);
			if (c1 !== null && mySeq === seq) {
				setCoins(c1);
				return;
			}
		} catch {}

		try {
			const me = await userApi.getMe(fetcher);
			const c2 = extractCoins(me);
			if (c2 !== null && mySeq === seq) setCoins(c2);
		} catch {}
	})().finally(() => {
		inFlight = null;
	});

	return inFlight;
};

export const startCoinsSync = (fetcher?: typeof fetch, options?: { intervalMs?: number }) => {
	if (!browser) return () => {};

	const intervalMs = options?.intervalMs ?? 15000;

	void refreshCoins(fetcher);

	const onFocus = () => void refreshCoins(fetcher);
	const onVisibility = () => {
		if (document.visibilityState === 'visible') void refreshCoins(fetcher);
	};

	window.addEventListener('focus', onFocus);
	document.addEventListener('visibilitychange', onVisibility);

	const id = window.setInterval(() => {
		void refreshCoins(fetcher);
	}, intervalMs);

	return () => {
		window.removeEventListener('focus', onFocus);
		document.removeEventListener('visibilitychange', onVisibility);
		window.clearInterval(id);
	};
};
