import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import { UserData } from '$lib/stores/userData.svelte';

export const COINS_STORAGE_KEY = 'algoduck:coins';

export const coins = writable<number>(0);

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

const setUserDataCoins = (n: number) => {
	try {
		UserData.user.coins = n;
	} catch {}
};

const applyCoins = (n: number, persist: boolean, broadcast: boolean) => {
	if (!Number.isFinite(n)) return;
	const next = Math.max(0, Math.trunc(n));
	if (get(coins) !== next) coins.set(next);

	if (persist && browser) {
		try {
			window.localStorage.setItem(COINS_STORAGE_KEY, String(next));
		} catch {}
	}

	setUserDataCoins(next);

	if (broadcast && browser) {
		try {
			window.dispatchEvent(new CustomEvent('algoduck:coins', { detail: next }));
		} catch {}
	}
};

export const setCoins = (value: unknown) => {
	const n = coerceNumber(value);
	if (n === null) return;
	applyCoins(n, true, true);
};

export const addCoins = (delta: unknown) => {
	const n = coerceNumber(delta);
	if (n === null) return;
	applyCoins(get(coins) + n, true, true);
};

export const spendCoins = (amount: unknown) => {
	const n = coerceNumber(amount);
	if (n === null) return;
	applyCoins(get(coins) - n, true, true);
};

let inited = false;

export const initCoinsSync = () => {
	if (!browser) return;
	if (inited) return;
	inited = true;

	try {
		const fromUserData = coerceNumber(
			(UserData as unknown as { user?: { coins?: unknown } })?.user?.coins
		);
		if (fromUserData !== null) applyCoins(fromUserData, false, false);
	} catch {}

	try {
		const raw = window.localStorage.getItem(COINS_STORAGE_KEY);
		const n = coerceNumber(raw);
		if (n !== null) applyCoins(n, false, false);
	} catch {}

	window.addEventListener('storage', (e: StorageEvent) => {
		if (e.key !== COINS_STORAGE_KEY) return;
		const n = coerceNumber(e.newValue);
		if (n === null) return;
		applyCoins(n, false, false);
	});

	window.addEventListener('algoduck:coins', (e: Event) => {
		const ce = e as CustomEvent;
		const n = coerceNumber(ce.detail);
		if (n === null) return;
		applyCoins(n, true, false);
	});
};

export const withOptimisticSpend = async <T>(amount: number, fn: () => Promise<T>) => {
	const before = get(coins);
	applyCoins(before - amount, true, true);
	try {
		return await fn();
	} catch (err) {
		applyCoins(before, true, true);
		throw err;
	}
};

export const withOptimisticEarn = async <T>(amount: number, fn: () => Promise<T>) => {
	const before = get(coins);
	applyCoins(before + amount, true, true);
	try {
		return await fn();
	} catch (err) {
		applyCoins(before, true, true);
		throw err;
	}
};
