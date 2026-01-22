import { PUBLIC_API_URL, PUBLIC_FRONTEND_URL } from '$env/static/public';


export function requireApiUrl() {
	if (!PUBLIC_API_URL) throw new Error('Missing PUBLIC_API_URL');
	return PUBLIC_API_URL;
}

export function requireFrontendUrl() {
	if (!PUBLIC_FRONTEND_URL) throw new Error('Missing PUBLIC_FRONTEND_URL');
	return PUBLIC_FRONTEND_URL;
}
