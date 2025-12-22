// import { PUBLIC_API_URL, PUBLIC_FRONTEND_URL } from '$env/static/public';

export const API_URL = "http://localhost:8080/api";
export const FRONTEND_URL = "http://localhost:5173";

export function requireApiUrl() {
	if (!API_URL) throw new Error('Missing PUBLIC_API_URL');
	return API_URL;
}

export function requireFrontendUrl() {
	if (!FRONTEND_URL) throw new Error('Missing PUBLIC_FRONTEND_URL');
	return FRONTEND_URL;
}
