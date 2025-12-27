import { PUBLIC_API_URL } from '$env/static/public';

export type QueryResult = 'Success' | 'Warning' | 'Error';

export type StandardResponseDto<T = {}> = {
	status: QueryResult;
	message: string | null;
	body: T;
};

const normalizeApiOrigin = (v: string) => {
	const s = (v ?? '').trim().replace(/\/+$/, '');
	return s.endsWith('/api') ? s.slice(0, -4) : s;
};

const origin = normalizeApiOrigin(PUBLIC_API_URL ?? '');
export const API_URL: string = origin ? `${origin}/api` : '';

const getCookie = (name: string): string | null => {
	if (typeof document === 'undefined') return null;
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		const raw = parts.pop()?.split(';').shift() ?? null;
		return raw ? decodeURIComponent(raw) : null;
	}
	return null;
};

const isStandardResponseDto = (v: unknown): v is StandardResponseDto<unknown> => {
	if (!v || typeof v !== 'object') return false;
	const o = v as Record<string, unknown>;
	return typeof o.status === 'string' && 'body' in o && 'message' in o;
};

const shouldSetJsonContentType = (body: RequestInit['body']): boolean => {
	if (body == null) return true;
	if (typeof body === 'string') return true;
	if (typeof FormData !== 'undefined' && body instanceof FormData) return false;
	if (typeof Blob !== 'undefined' && body instanceof Blob) return false;
	if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) return false;
	if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return false;
	return true;
};

export const FetchJsonFromApi = async <TResult>(
	endpoint: string,
	fetchOptions: RequestInit = {},
	fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	searchParams?: URLSearchParams,
	replay: boolean = false
): Promise<TResult> => {
	if (!API_URL) {
		throw new Error(
			'Missing PUBLIC_API_URL (set it in the frontend environment and restart the dev server).'
		);
	}

	const usedFetcher = fetcher ?? fetch;
	const cleanEndpoint = endpoint.replace(/^\//, '');
	const url = new URL(`${API_URL}/${cleanEndpoint}`);

	if (searchParams) {
		url.search = searchParams.toString();
	}

	const csrfToken = getCookie('csrf_token');

	let res: Response;
	try {
		const body = fetchOptions.body;

		const headers: Record<string, string> = {
			...(shouldSetJsonContentType(body) ? { 'Content-Type': 'application/json' } : {}),
			...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
		};

		res = await usedFetcher(url.toString(), {
			credentials: 'include',
			headers: {
				...headers,
				...(fetchOptions.headers || {})
			},
			...fetchOptions
		});
	} catch {
		throw new Error('Backend unavailable.');
	}

	if (!res.ok) {
		if (res.status === 401 && res.headers.get('X-Token-Expired') === 'true' && !replay) {
			await FetchJsonFromApi('auth/refresh', { method: 'POST' }, fetcher, undefined, true);
			return await FetchJsonFromApi<TResult>(endpoint, fetchOptions, fetcher, searchParams, true);
		}

		const ct = res.headers.get('content-type') ?? '';
		let msg = `API Error ${res.status}: ${res.statusText}`;

		if (ct.includes('application/json')) {
			try {
				const data = (await res.json()) as unknown;
				if (isStandardResponseDto(data)) {
					const m = (data.message ?? '').toString().trim();
					if (m) msg = m;
				} else if (data && typeof data === 'object') {
					const maybeMessage = (data as Record<string, unknown>).message;
					if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
						msg = maybeMessage.trim();
					}
				}
			} catch {}
		} else {
			try {
				const detail = (await res.text()).trim();
				if (detail) msg = `${msg} - ${detail}`;
			} catch {}
		}

		throw new Error(msg);
	}

	const contentType = res.headers.get('content-type') ?? '';
	if (!contentType.includes('application/json')) {
		return undefined as unknown as TResult;
	}

	return (await res.json()) as TResult;
};

export const FetchFromApi = async <TResult>(
	endpoint: string,
	fetchOptions: RequestInit = {},
	fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	searchParams?: URLSearchParams,
	replay: boolean = false
): Promise<StandardResponseDto<TResult>> => {
	return await FetchJsonFromApi<StandardResponseDto<TResult>>(
		endpoint,
		fetchOptions,
		fetcher,
		searchParams,
		replay
	);
};
