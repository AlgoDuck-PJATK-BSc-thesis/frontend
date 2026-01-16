import { browser } from '$app/environment';
import { UserData } from '$lib/stores/userData.svelte';

const COINS_STORAGE_KEY = 'algoduck:coins';

export const Coins = $state<{ value: number }>({ value: 0 });

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

const persist = (n: number) => {
	if (!browser) return;
	try {
		window.localStorage.setItem(COINS_STORAGE_KEY, String(n));
	} catch {}
};

const syncUserData = (n: number) => {
	try {
		UserData.user.coins = n;
	} catch {}
};

export const setCoins = (value: unknown, emit = true) => {
	const n = coerceNumber(value);
	if (n === null) return;

	if (Coins.value !== n) Coins.value = n;

	syncUserData(n);
	persist(n);

	if (browser && emit) {
		try {
			window.dispatchEvent(new CustomEvent('algoduck:coins', { detail: n }));
		} catch {}
	}
};

export const addCoins = (delta: number) => {
	if (!Number.isFinite(delta)) return;
	setCoins(Coins.value + delta);
};

export const spendCoins = (delta: number) => {
	if (!Number.isFinite(delta)) return;
	setCoins(Math.max(0, Coins.value - delta));
};

let initialized = false;

export const initCoins = () => {
	if (!browser) return;
	if (initialized) return;
	initialized = true;

	try {
		const raw = window.localStorage.getItem(COINS_STORAGE_KEY);
		const n = coerceNumber(raw);
		if (n !== null) setCoins(n, false);
	} catch {}

	window.addEventListener('algoduck:coins', (e) => {
		const ce = e as CustomEvent;
		setCoins(ce.detail, false);
	});

	window.addEventListener('storage', (e) => {
		if (e.key !== COINS_STORAGE_KEY) return;
		setCoins(e.newValue, false);
	});
};
