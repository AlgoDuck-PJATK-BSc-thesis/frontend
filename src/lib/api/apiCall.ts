// import { PUBLIC_API_URL } from '$env/static/public';

export type QueryResult = 'Success' | 'Warning' | 'Error';

export type StandardResponseDto<T = {}> = {
	status: QueryResult;
	message: string | null;
	body: T;
};

// const base = (PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
export const API_URL: string = "http://localhost:8080/api";

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
		res = await usedFetcher(url.toString(), {
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
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

		let detail = '';
		try {
			detail = await res.text();
		} catch {
			detail = '';
		}
		throw new Error(`API Error ${res.status}: ${res.statusText}${detail ? ` - ${detail}` : ''}`);
	}

	const contentType = res.headers.get('content-type') ?? '';
	if (!contentType.includes('application/json')) {
		return undefined as unknown as TResult;
	}

	console.log(res);
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


