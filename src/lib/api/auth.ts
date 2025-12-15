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

export type PasswordResetRequestRequest = {
	email: string;
};

export type PasswordResetRequestResponse = {
	message: string;
};

export type PasswordResetResetRequest = {
	userId: string;
	token: string;
	password: string;
	confirmPassword: string;
};

export type PasswordResetResetResponse = {
	message: string;
};

export type ExternalLoginRequest = {
	provider: string;
	externalUserId: string;
	email: string;
	displayName: string;
};

export type ExternalLoginResponse = {
	message: string;
	userId: string;
	sessionId: string;
	accessTokenExpiresAt: string;
	refreshTokenExpiresAt: string;
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
	},

	requestPasswordReset: async (
		req: PasswordResetRequestRequest,
		fetcher?: typeof fetch
	): Promise<PasswordResetRequestResponse> => {
		return await FetchJsonFromApi<PasswordResetRequestResponse>(
			'auth/password-reset/request',
			{
				method: 'POST',
				body: JSON.stringify({
					email: req.email
				})
			},
			fetcher
		);
	},

	resetPassword: async (
		req: PasswordResetResetRequest,
		fetcher?: typeof fetch
	): Promise<PasswordResetResetResponse> => {
		return await FetchJsonFromApi<PasswordResetResetResponse>(
			'auth/password-reset/reset',
			{
				method: 'POST',
				body: JSON.stringify({
					userId: req.userId,
					token: req.token,
					password: req.password,
					confirmPassword: req.confirmPassword
				})
			},
			fetcher
		);
	},

	externalLogin: async (
		req: ExternalLoginRequest,
		fetcher?: typeof fetch
	): Promise<ExternalLoginResponse> => {
		return await FetchJsonFromApi<ExternalLoginResponse>(
			'auth/external-login',
			{
				method: 'POST',
				body: JSON.stringify({
					provider: req.provider,
					externalUserId: req.externalUserId,
					email: req.email,
					displayName: req.displayName
				})
			},
			fetcher
		);
	}
};
