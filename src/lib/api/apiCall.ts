import { PUBLIC_API_URL } from '$env/static/public';

export type QueryResult = 'Success' | 'Warning' | 'Error';

export type StandardResponseDto<T = unknown> = {
	status: QueryResult;
	message: string | null;
	body: T;
};

export class ApiError<T = unknown> extends Error {
	constructor(
		message: string,
		public status: number,
		public response: StandardResponseDto<T>
	) {
		super(message);
		this.name = 'ApiError';
	}
}

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

const isApiDebugEnabled = (): boolean => {
	try {
		if (typeof localStorage !== 'undefined' && localStorage.getItem('api_debug') === '1')
			return true;
	} catch {}
	try {
		const w = typeof window !== 'undefined' ? (window as any) : null;
		if (w && w.__API_DEBUG__ === true) return true;
	} catch {}
	return false;
};

const makeRequestId = (): string => {
	try {
		const c: any = typeof crypto !== 'undefined' ? crypto : null;
		if (c && typeof c.randomUUID === 'function') return c.randomUUID();
	} catch {}
	const a = Math.random().toString(16).slice(2);
	const b = Math.random().toString(16).slice(2);
	return `${Date.now().toString(16)}-${a}-${b}`;
};

const buildError = (message: string, meta: Record<string, unknown>) => {
	const err = new Error(message);
	for (const [k, v] of Object.entries(meta)) (err as any)[k] = v;
	return err;
};

const getFieldCI = (o: Record<string, unknown>, name: string): unknown => {
	if (name in o) return o[name];
	const want = name.toLowerCase();
	for (const k of Object.keys(o)) {
		if (k.toLowerCase() === want) return o[k];
	}
	return undefined;
};

const hasFieldCI = (o: Record<string, unknown>, name: string): boolean => {
	const want = name.toLowerCase();
	for (const k of Object.keys(o)) {
		if (k.toLowerCase() === want) return true;
	}
	return false;
};

const asTrimmedStringOrNull = (v: unknown): string | null => {
	if (typeof v !== 'string') return null;
	const s = v.trim();
	return s ? s : null;
};

const normalizeQueryResult = (v: unknown): QueryResult | null => {
	if (typeof v !== 'string') return null;
	const s = v.trim().toLowerCase();
	if (s === 'success') return 'Success';
	if (s === 'warning') return 'Warning';
	if (s === 'error') return 'Error';
	return null;
};

const extractMessageFromJson = (parsed: unknown): string | null => {
	if (parsed == null) return null;

	if (typeof parsed === 'string') {
		const s = parsed.trim();
		return s ? s : null;
	}

	if (typeof parsed !== 'object') return null;

	const o = parsed as Record<string, unknown>;

	const msg = asTrimmedStringOrNull(getFieldCI(o, 'message'));
	if (msg) return msg;

	const detail = asTrimmedStringOrNull(getFieldCI(o, 'detail'));
	if (detail) return detail;

	const title = asTrimmedStringOrNull(getFieldCI(o, 'title'));
	if (title) return title;

	const errors = getFieldCI(o, 'errors');
	if (errors && typeof errors === 'object') {
		const e = errors as Record<string, unknown>;
		for (const v of Object.values(e)) {
			if (Array.isArray(v)) {
				for (const item of v) {
					const s = asTrimmedStringOrNull(item);
					if (s) return s;
				}
			} else {
				const s = asTrimmedStringOrNull(v);
				if (s) return s;
			}
		}
	}

	const statusText = asTrimmedStringOrNull(getFieldCI(o, 'status'));
	if (statusText && statusText.toLowerCase() === 'error') {
		const fallback = asTrimmedStringOrNull(getFieldCI(o, 'code'));
		if (fallback) return fallback;
	}

	return null;
};

const normalizeStandardResponse = <T>(
	raw: unknown,
	fallbackStatus: QueryResult
): StandardResponseDto<T> => {
	if (raw && typeof raw === 'object') {
		const o = raw as Record<string, unknown>;
		const isWrapped = hasFieldCI(o, 'status') && hasFieldCI(o, 'message') && hasFieldCI(o, 'body');

		if (isWrapped) {
			const status = normalizeQueryResult(getFieldCI(o, 'status')) ?? fallbackStatus;
			const message = asTrimmedStringOrNull(getFieldCI(o, 'message'));
			const body = getFieldCI(o, 'body') as T;
			return { status, message, body };
		}

		return { status: fallbackStatus, message: null, body: raw as T };
	}

	return { status: fallbackStatus, message: null, body: raw as T };
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

	const method = ((fetchOptions.method ?? 'GET') as string).toUpperCase();
	const requestId = makeRequestId();
	const debug = isApiDebugEnabled();
	const startedAt = Date.now();

	const csrfToken = getCookie('csrf_token');

	let res: Response;
	try {
		const body = fetchOptions.body;
		const merged = new Headers(fetchOptions.headers ?? {});

		if (!merged.has('Accept')) merged.set('Accept', 'application/json');
		if (shouldSetJsonContentType(body) && !merged.has('Content-Type'))
			merged.set('Content-Type', 'application/json');
		if (csrfToken && !merged.has('X-CSRF-Token')) merged.set('X-CSRF-Token', csrfToken);
		if (!merged.has('X-Client-Request-Id')) merged.set('X-Client-Request-Id', requestId);

		if (debug && typeof console !== 'undefined') {
			console.log('[api]', { requestId, method, url: url.toString() });
		}

		res = await usedFetcher(url.toString(), {
			...fetchOptions,
			credentials: fetchOptions.credentials ?? 'include',
			headers: merged
		});
	} catch (e) {
		const durationMs = Date.now() - startedAt;
		const msg = `Backend unavailable [${method} ${cleanEndpoint} id:${requestId}]`;

		if (debug && typeof console !== 'undefined') {
			console.error('[api:error]', {
				requestId,
				method,
				url: url.toString(),
				durationMs,
				error: e
			});
		}

		const err = new ApiError(msg, 0, { status: 'Error', message: msg, body: null });
		(err as any).requestId = requestId;
		(err as any).method = method;
		(err as any).endpoint = cleanEndpoint;
		(err as any).url = url.toString();
		(err as any).durationMs = durationMs;
		throw err;
	}

	const durationMs = Date.now() - startedAt;

	if (!res.ok) {
		if (res.status === 401 && !replay) {
			try {
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
			} catch {}
		}

		const ct = res.headers.get('content-type') ?? '';
		let msg = `API Error ${res.status}: ${res.statusText}`;
		let parsed: unknown = null;
		let parsedMessage: string | null = null;
		let detailText: string | null = null;

		if (ct.includes('application/json')) {
			try {
				parsed = (await res.json()) as unknown;
			} catch {
				parsed = null;
			}

			parsedMessage = extractMessageFromJson(parsed);

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
				const t = (await res.text()).trim();
				if (t) detailText = t;
			} catch {
				detailText = null;
			}
			if (detailText) msg = `${msg} - ${detailText}`;
		}

		const responseDtoBase = ct.includes('application/json')
			? normalizeStandardResponse<unknown>(parsed, 'Error')
			: ({ status: 'Error', message: null, body: detailText } as StandardResponseDto<unknown>);

		const responseDto: StandardResponseDto<unknown> = {
			status: responseDtoBase.status ?? 'Error',
			message: responseDtoBase.message ?? parsedMessage ?? (detailText ? detailText : null) ?? msg,
			body: responseDtoBase.body
		};

		const fullMsg = `${msg} [${method} ${cleanEndpoint} ${res.status} id:${requestId}]`;

		if (debug && typeof console !== 'undefined') {
			console.error('[api:fail]', {
				requestId,
				method,
				url: url.toString(),
				endpoint: cleanEndpoint,
				status: res.status,
				durationMs,
				message: msg,
				parsed
			});
		}

		const err = new ApiError(fullMsg, res.status, responseDto);
		(err as any).requestId = requestId;
		(err as any).method = method;
		(err as any).endpoint = cleanEndpoint;
		(err as any).url = url.toString();
		(err as any).durationMs = durationMs;
		throw err;
	}

	if (debug && typeof console !== 'undefined') {
		console.log('[api:ok]', {
			requestId,
			method,
			url: url.toString(),
			status: res.status,
			durationMs
		});
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
	const raw = await FetchJsonFromApi<unknown>(
		endpoint,
		fetchOptions,
		fetcher,
		searchParams,
		replay,
		csrfReplay
	);

	return normalizeStandardResponse<TResult>(raw, 'Success');
};