import { FetchFromApi } from '$lib/api/apiCall';

export type AuthUserDto = {
	id: string;
	userName: string;
	email: string;
	emailConfirmed: boolean;
};

export type LoginRequest = {
	userNameOrEmail: string;
	password: string;
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

export type VerifyTwoFactorLoginRequest = {
	challengeId: string;
	code: string;
};

export type VerifyTwoFactorLoginResponse = {
	message: string;
	userId: string;
	sessionId: string;
	accessTokenExpiresAt: string;
	refreshTokenExpiresAt: string;
};

export type StartEmailVerificationRequest = {
	email: string;
};

export type StartEmailVerificationResponse = {
	message: string;
};

export type UserByTokenRequest = {
	userId: string;
	token: string;
};

export type UserSessionDto = {
	sessionId: string;
	createdAt: string;
	lastUsedAt: string;
	ipAddress: string | null;
	userAgent: string | null;
	isCurrent: boolean;
};

export type RevokeSessionRequest = {
	sessionId: string;
};

export type RevokeOtherSessionsRequest = Record<string, unknown>;

export type ApiKeyDto = {
	id: string;
	name: string;
	createdAt: string;
	expiresAt: string | null;
	lastUsedAt: string | null;
};

export type GenerateApiKeyRequest = {
	name?: string;
	expiresAt?: string | null;
};

export type GenerateApiKeyResponse = {
	apiKey: string;
	rawKey: string;
};

export type PermissionsCheckRequest = {
	permissions: string[];
};

export type PermissionsCheckResponse = Record<string, boolean>;

export type SearchUsersRequest = {
	query: string;
	limit?: number;
};

export type ValidateTokenRequest = {
	accessToken: string;
	csrfToken?: string | null;
};

export type ValidateTokenResponse = {
	isValid: boolean;
	isExpired: boolean;
	userId: string | null;
	sessionId: string | null;
	expiresAt: string | null;
};

export type ChangeEmailStartRequest = {
	newEmail: string;
};

export type ChangeEmailStartResponse = {
	message: string;
};

export type ChangeEmailConfirmRequest = {
	userId: string;
	newEmail: string;
	token: string;
};

export type ChangeEmailConfirmResponse = {
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
		const res = await FetchFromApi<LoginResponse>(
			'auth/login',
			{
				method: 'POST',
				body: JSON.stringify({
					userNameOrEmail: req.userNameOrEmail,
					password: req.password
				})
			},
			fetcher
		);
		return res.body;
	},

	verifyTwoFactorLogin: async (
		req: VerifyTwoFactorLoginRequest,
		fetcher?: typeof fetch
	): Promise<VerifyTwoFactorLoginResponse> => {
		const res = await FetchFromApi<VerifyTwoFactorLoginResponse>(
			'auth/twofactor/verify-login',
			{
				method: 'POST',
				body: JSON.stringify({
					challengeId: req.challengeId,
					code: req.code
				})
			},
			fetcher
		);
		return res.body;
	},

	register: async (req: RegisterRequest, fetcher?: typeof fetch): Promise<RegisterResponse> => {
		const res = await FetchFromApi<RegisterResponse>(
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
		return res.body;
	},

	me: async (fetcher?: typeof fetch): Promise<AuthUserDto> => {
		const res = await FetchFromApi<AuthUserDto>('auth/me', { method: 'GET' }, fetcher);
		return res.body;
	},

	userByToken: async (req: UserByTokenRequest, fetcher?: typeof fetch): Promise<AuthUserDto> => {
		const res = await FetchFromApi<AuthUserDto>(
			'auth/user-by-token',
			{
				method: 'POST',
				body: JSON.stringify({
					userId: req.userId,
					token: req.token
				})
			},
			fetcher
		);
		return res.body;
	},

	logout: async (fetcher?: typeof fetch): Promise<{ message: string }> => {
		const res = await FetchFromApi<{ message: string }>('auth/logout', { method: 'POST' }, fetcher);
		return res.body;
	},

	refresh: async (fetcher?: typeof fetch): Promise<unknown> => {
		const res = await FetchFromApi<unknown>('auth/refresh', { method: 'POST' }, fetcher);
		return res.body;
	},

	requestPasswordReset: async (
		req: PasswordResetRequestRequest,
		fetcher?: typeof fetch
	): Promise<PasswordResetRequestResponse> => {
		const res = await FetchFromApi<PasswordResetRequestResponse>(
			'auth/password-reset/request',
			{
				method: 'POST',
				body: JSON.stringify({
					email: req.email
				})
			},
			fetcher
		);
		return res.body;
	},

	resetPassword: async (
		req: PasswordResetResetRequest,
		fetcher?: typeof fetch
	): Promise<PasswordResetResetResponse> => {
		const res = await FetchFromApi<PasswordResetResetResponse>(
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
		return res.body;
	},

	startEmailVerification: async (
		req: StartEmailVerificationRequest,
		fetcher?: typeof fetch
	): Promise<StartEmailVerificationResponse> => {
		const res = await FetchFromApi<StartEmailVerificationResponse>(
			'auth/email-verification/start',
			{
				method: 'POST',
				body: JSON.stringify({
					email: req.email
				})
			},
			fetcher
		);
		return res.body;
	},

	enableTwoFactor: async (fetcher?: typeof fetch): Promise<{ message: string }> => {
		const res = await FetchFromApi<{ message: string }>(
			'auth/twofactor/enable',
			{ method: 'POST' },
			fetcher
		);
		return res.body;
	},

	disableTwoFactor: async (fetcher?: typeof fetch): Promise<{ message: string }> => {
		const res = await FetchFromApi<{ message: string }>(
			'auth/twofactor/disable',
			{ method: 'POST' },
			fetcher
		);
		return res.body;
	},

	getSessions: async (fetcher?: typeof fetch): Promise<UserSessionDto[]> => {
		const res = await FetchFromApi<UserSessionDto[]>('auth/sessions', { method: 'GET' }, fetcher);
		return res.body;
	},

	revokeSession: async (req: RevokeSessionRequest, fetcher?: typeof fetch): Promise<unknown> => {
		const res = await FetchFromApi<unknown>(
			'auth/sessions/revoke',
			{
				method: 'POST',
				body: JSON.stringify(req)
			},
			fetcher
		);
		return res.body;
	},

	revokeOtherSessions: async (
		req: RevokeOtherSessionsRequest = {},
		fetcher?: typeof fetch
	): Promise<unknown> => {
		const res = await FetchFromApi<unknown>(
			'auth/sessions/revoke-others',
			{
				method: 'POST',
				body: JSON.stringify(req)
			},
			fetcher
		);
		return res.body;
	},

	getApiKeys: async (fetcher?: typeof fetch): Promise<ApiKeyDto[]> => {
		const res = await FetchFromApi<ApiKeyDto[]>('auth/api-keys', { method: 'GET' }, fetcher);
		return res.body;
	},

	generateApiKey: async (
		req: GenerateApiKeyRequest = {},
		fetcher?: typeof fetch
	): Promise<GenerateApiKeyResponse> => {
		const res = await FetchFromApi<GenerateApiKeyResponse>(
			'auth/api-keys',
			{
				method: 'POST',
				body: JSON.stringify(req)
			},
			fetcher
		);
		return res.body;
	},

	revokeApiKey: async (id: string, fetcher?: typeof fetch): Promise<{ message: string }> => {
		const clean = id.trim();
		const res = await FetchFromApi<{ message: string }>(
			`auth/api-keys/${encodeURIComponent(clean)}`,
			{ method: 'DELETE' },
			fetcher
		);
		return res.body;
	},

	checkPermissions: async (
		req: PermissionsCheckRequest,
		fetcher?: typeof fetch
	): Promise<PermissionsCheckResponse> => {
		const res = await FetchFromApi<PermissionsCheckResponse>(
			'auth/permissions/check',
			{
				method: 'POST',
				body: JSON.stringify({
					permissions: req.permissions
				})
			},
			fetcher
		);
		return res.body;
	},

	searchUsers: async (req: SearchUsersRequest, fetcher?: typeof fetch): Promise<AuthUserDto[]> => {
		const res = await FetchFromApi<AuthUserDto[]>(
			'auth/search-users',
			{
				method: 'POST',
				body: JSON.stringify({
					query: req.query,
					limit: req.limit ?? 20
				})
			},
			fetcher
		);
		return res.body;
	},

	validateToken: async (
		req: ValidateTokenRequest,
		fetcher?: typeof fetch
	): Promise<ValidateTokenResponse> => {
		const res = await FetchFromApi<ValidateTokenResponse>(
			'auth/validate-token',
			{
				method: 'POST',
				body: JSON.stringify({
					accessToken: req.accessToken,
					csrfToken: req.csrfToken ?? null
				})
			},
			fetcher
		);
		return res.body;
	},

	changeEmailStart: async (
		req: ChangeEmailStartRequest,
		fetcher?: typeof fetch
	): Promise<unknown> => {
		const res = await FetchFromApi<unknown>(
			'auth/email/change/start',
			{
				method: 'POST',
				body: JSON.stringify(req)
			},
			fetcher
		);
		return res.body;
	},

	changeEmailConfirm: async (
		req: ChangeEmailConfirmRequest,
		fetcher?: typeof fetch
	): Promise<unknown> => {
		const res = await FetchFromApi<unknown>(
			'auth/email/change/confirm',
			{
				method: 'POST',
				body: JSON.stringify(req)
			},
			fetcher
		);
		return res.body;
	},

	externalLogin: async (
		req: ExternalLoginRequest,
		fetcher?: typeof fetch
	): Promise<ExternalLoginResponse> => {
		const res = await FetchFromApi<ExternalLoginResponse>(
			'auth/external-login',
			{
				method: 'POST',
				body: JSON.stringify(req)
			},
			fetcher
		);
		return res.body;
	}
};
