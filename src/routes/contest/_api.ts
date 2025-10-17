const BASE = 'http://localhost:5082';

export async function api<T>(
	path: string,
	opts: RequestInit = {},
	fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
): Promise<T> {
	const f = fetcher ?? fetch;
	const res = await f(`${BASE}${path}`, {
		credentials: 'include',
		headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
		...opts
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${text.slice(0,200)}`);
	return text ? (JSON.parse(text) as T) : ({} as T);
}
