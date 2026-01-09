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

const isCsrfFailureMessage = (msg: string | null | undefined) => {
	const m = (msg ?? '').trim().toLowerCase();
	return m.includes('csrf validation failed');
};

export const FetchJsonFromApi = async <TResult>(
	endpoint: string,
	fetchOptions: RequestInit = {},
	fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	searchParams?: URLSearchParams,
	replay: boolean = false,
	csrfReplay: boolean = false
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
		const merged = new Headers(fetchOptions.headers ?? {});

		if (!merged.has('Accept')) merged.set('Accept', 'application/json');
		if (shouldSetJsonContentType(body) && !merged.has('Content-Type'))
			merged.set('Content-Type', 'application/json');
		if (csrfToken && !merged.has('X-CSRF-Token')) merged.set('X-CSRF-Token', csrfToken);

		res = await usedFetcher(url.toString(), {
			...fetchOptions,
			credentials: fetchOptions.credentials ?? 'include',
			headers: merged
		});
	} catch {
		throw new Error('Backend unavailable.');
	}

	console.log(res);
	if (!res.ok) {
		if (res.status === 401 && res.headers.get('X-Token-Expired') === 'true' && !replay) {
			await FetchJsonFromApi(
				'auth/refresh',
				{ method: 'POST' },
				fetcher,
				undefined,
				true,
				csrfReplay
			);
			return await FetchJsonFromApi<TResult>(
				endpoint,
				fetchOptions,
				fetcher,
				searchParams,
				true,
				csrfReplay
			);
		}

		const ct = res.headers.get('content-type') ?? '';
		let msg = `API Error ${res.status}: ${res.statusText}`;

		if (ct.includes('application/json')) {
			let parsed: unknown = null;

			try {
				parsed = (await res.json()) as unknown;
			} catch {
				parsed = null;
			}

			let parsedMessage: string | null = null;

			if (isStandardResponseDto(parsed)) {
				const m = (parsed.message ?? '').toString().trim();
				if (m) parsedMessage = m;
			} else if (parsed && typeof parsed === 'object') {
				const maybeMessage = (parsed as Record<string, unknown>).message;
				if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
					parsedMessage = maybeMessage.trim();
				}
			}

			if (res.status === 403 && !csrfReplay && isCsrfFailureMessage(parsedMessage)) {
				return await FetchJsonFromApi<TResult>(
					endpoint,
					fetchOptions,
					fetcher,
					searchParams,
					replay,
					true
				);
			}

			if (parsedMessage) msg = parsedMessage;
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
	replay: boolean = false,
	csrfReplay: boolean = false
): Promise<StandardResponseDto<TResult>> => {
	return await FetchJsonFromApi<StandardResponseDto<TResult>>(
		endpoint,
		fetchOptions,
		fetcher,
		searchParams,
		replay,
		csrfReplay
	);
};
