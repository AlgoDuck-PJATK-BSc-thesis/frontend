import { FetchJsonFromApi } from '$lib/api/apiCall';

export type AuthUserDto = {
	id: string;
	userName: string;
	email: string;
	emailConfirmed: boolean;
};

export type LoginRequest = {
	userNameOrEmail: string;
	password: string;
	rememberMe?: boolean;
};

export type LoginOk = {
	message: string;
	twoFactorRequired: false;
	userId: string;
	sessionId: string;
	accessTokenExpiresAt: string;
	refreshTokenExpiresAt: string;
};

export type LoginTwoFactor = {
	message: string;
	twoFactorRequired: true;
	challengeId: string;
	expiresAt: string;
};

export type LoginResponse = LoginOk | LoginTwoFactor;

export type RegisterRequest = {
	userName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export type RegisterResponse = {
	id: string;
	userName: string;
	email: string;
	emailConfirmed: boolean;
};

export const authApi = {
	login: async (req: LoginRequest, fetcher?: typeof fetch): Promise<LoginResponse> => {
		return await FetchJsonFromApi<LoginResponse>(
			'auth/login',
			{
				method: 'POST',
				body: JSON.stringify({
					userNameOrEmail: req.userNameOrEmail,
					password: req.password,
					rememberMe: !!req.rememberMe
				})
			},
			fetcher
		);
	},

	register: async (req: RegisterRequest, fetcher?: typeof fetch): Promise<RegisterResponse> => {
		return await FetchJsonFromApi<RegisterResponse>(
			'auth/register',
			{
				method: 'POST',
				body: JSON.stringify({
					userName: req.userName,
					email: req.email,
					password: req.password,
					confirmPassword: req.confirmPassword
				})
			},
			fetcher
		);
	},

	me: async (fetcher?: typeof fetch): Promise<AuthUserDto> => {
		return await FetchJsonFromApi<AuthUserDto>('auth/me', { method: 'GET' }, fetcher);
	},

	logout: async (fetcher?: typeof fetch): Promise<{ message: string }> => {
		return await FetchJsonFromApi<{ message: string }>('auth/logout', { method: 'POST' }, fetcher);
	},

	refresh: async (fetcher?: typeof fetch): Promise<unknown> => {
		return await FetchJsonFromApi<unknown>('auth/refresh', { method: 'POST' }, fetcher);
	}
};
