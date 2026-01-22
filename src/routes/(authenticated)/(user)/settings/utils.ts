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
	if (!t) return '!';
	return t.endsWith('!') ? t : `${t}!`;
};

export const formatErrorMessage = (e: unknown, fallback: string) => {
	const anyE = e as any;
	const base = anyE?.message ? String(anyE.message) : fallback;
	const extras: string[] = [];
	if (anyE?.status) extras.push(`HTTP ${String(anyE.status)}`);
	if (anyE?.requestId) extras.push(`req ${String(anyE.requestId)}`);
	if (extras.length) return `${base} (${extras.join(', ')})`;
	return base;
};
