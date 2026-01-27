export type Notice = { type: 'success' | 'error'; message: string };

export const coerceString = (v: unknown) => (v ?? '').toString();

export const coerceBool = (v: unknown, fallback: boolean = false): boolean => {
	if (typeof v === 'boolean') return v;
	if (typeof v === 'number') return v !== 0;
	if (typeof v === 'string') {
		const s = v.trim().toLowerCase();
		if (s === 'true' || s === '1' || s === 'yes' || s === 'y' || s === 'on') return true;
		if (s === 'false' || s === '0' || s === 'no' || s === 'n' || s === 'off' || s === '')
			return false;
		return fallback;
	}
	return fallback;
};

export const normalizeToCloudfrontKey = (value: string): string => {
	const v = (value ?? '').toString().trim();
	if (!v) return '';
	if (v.startsWith('http://') || v.startsWith('https://')) {
		try {
			const u = new URL(v);
			const p = (u.pathname ?? '').replace(/^\/+/, '').trim();
			return p || '';
		} catch {
			return '';
		}
	}
	return v;
};

export const ensureBang = (s: string) => {
	const t = (s ?? '').toString().trim();
	if (!t) return '';
	if (/[.!?]$/.test(t)) return t;
	return `${t}!`;
};

export const formatErrorMessage = (e: unknown, fallback: string) => {
	const anyE = e as any;

	let base = fallback;
	if (typeof e === 'string') base = e;
	else if (e instanceof Error && e.message) base = e.message;
	else if (anyE?.body?.message) base = String(anyE.body.message);
	else if (anyE?.error?.message) base = String(anyE.error.message);
	else if (anyE?.message) base = String(anyE.message);

	base = base.replace(/\s*\(HTTP\s+\d+.*?\)\!?$/, '').trim();

	return base || fallback;
};
