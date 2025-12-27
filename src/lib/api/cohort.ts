import { FetchFromApi, API_URL } from '$lib/api/apiCall';
import * as signalR from '@microsoft/signalr';
import { userApi, type UserLeaderboardEntryDto } from '$lib/api/user';

export type CohortSummaryDto = {
	cohortId: string;
	name: string;
	isActive: boolean;
};

export type CohortDetailsDto = {
	cohortId: string;
	name: string;
	joinCode: string | null;
	isActive: boolean;
	isMember: boolean;
};

export type CreateCohortRequest = {
	name: string;
};

export type JoinCohortByCodeRequest = {
	code: string;
};

export type UpdateCohortRequest = {
	cohortId: string;
	name: string;
};

export type CohortMemberDto = {
	userId: string;
	userName: string;
	userAvatarUrl: string | null;
};

export type CohortMembersPageDto = {
	page: number;
	pageSize: number;
	totalCount: number;
	items: CohortMemberDto[];
};

export type CohortActiveMemberDto = {
	userId: string;
	userName: string;
	userAvatarUrl: string | null;
	lastSeenAt: string;
	isActive: boolean;
};

export type ChatMediaType = 'Text' | 'Image';

export type CohortMessageDto = {
	messageId: string;
	cohortId: string;
	userId: string;
	userName: string;
	userAvatarUrl: string | null;
	content: string | null;
	mediaType: ChatMediaType;
	mediaUrl: string | null;
	createdAt: string;
	isMine: boolean;
};

export type GetCohortMessagesResultDto = {
	items: CohortMessageDto[];
	nextCursor: string | null;
	hasMore: boolean;
};

export type UploadMediaResultDto = {
	mediaKey: string;
	mediaUrl: string;
	contentType: string;
	sizeBytes: number;
};

export type SendMessageRequestDto = {
	content: string | null;
	mediaType: ChatMediaType;
	mediaKey: string | null;
	mediaContentType: string | null;
};

export type SendMessageResultDto = {
	messageId: string;
	cohortId: string;
	userId: string;
	userName: string;
	userAvatarUrl: string | null;
	content: string | null;
	mediaType: ChatMediaType;
	mediaUrl: string | null;
	createdAt: string;
};

export type PresenceUpdatedDto = {
	userId: string;
	isActive: boolean;
	lastSeenAt: string;
};

export type LeaderboardItemDto = {
	rank: number;
	userId: string;
	userName: string;
	experience: number;
	amountSolved: number;
	userAvatarUrl: string | null;
};

const normalizeApiOrigin = (v: string) => {
	const s = (v ?? '').trim().replace(/\/+$/, '');
	return s.endsWith('/api') ? s.slice(0, -4) : s;
};

const apiOriginFromApiUrl = () => normalizeApiOrigin(API_URL ?? '');

const pickActive = (items: CohortSummaryDto[]) => items.find((x) => x.isActive) ?? null;

export type CohortChatConnectionHandlers = {
	onReceiveMessage?: (msg: SendMessageResultDto) => void;
	onPresenceUpdated?: (update: PresenceUpdatedDto) => void;
	onMessageRejected?: (reason: string) => void;
	onError?: (err: unknown) => void;
};

export const cohortApi = {
	getMyCohorts: async (fetcher?: typeof fetch): Promise<CohortSummaryDto[]> => {
		const res = await FetchFromApi<{ items: CohortSummaryDto[] }>(
			'cohorts/me',
			{ method: 'GET' },
			fetcher
		);
		return res.body?.items ?? [];
	},

	getCurrent: async (fetcher?: typeof fetch): Promise<CohortDetailsDto | null> => {
		const my = await cohortApi.getMyCohorts(fetcher);
		const active = pickActive(my);
		if (!active) return null;
		return await cohortApi.getById(active.cohortId, fetcher);
	},

	getById: async (cohortId: string, fetcher?: typeof fetch): Promise<CohortDetailsDto> => {
		const id = cohortId.trim();
		const res = await FetchFromApi<CohortDetailsDto>(
			`cohorts/${encodeURIComponent(id)}`,
			{ method: 'GET' },
			fetcher
		);
		return res.body;
	},

	create: async (req: CreateCohortRequest, fetcher?: typeof fetch): Promise<CohortDetailsDto> => {
		const res = await FetchFromApi<{
			cohortId: string;
			name: string;
			joinCode: string | null;
			isActive: boolean;
		}>('cohorts', { method: 'POST', body: JSON.stringify({ name: req.name }) }, fetcher);

		const created = res.body;
		return {
			cohortId: created.cohortId,
			name: created.name,
			joinCode: created.joinCode ?? null,
			isActive: created.isActive,
			isMember: true
		};
	},

	joinByCode: async (
		req: JoinCohortByCodeRequest,
		fetcher?: typeof fetch
	): Promise<CohortDetailsDto> => {
		const res = await FetchFromApi<{ cohortId: string; name: string; isActive: boolean }>(
			'cohorts/join',
			{ method: 'POST', body: JSON.stringify({ code: req.code }) },
			fetcher
		);

		const joined = res.body;
		return await cohortApi.getById(joined.cohortId, fetcher);
	},

	joinById: async (cohortId: string, fetcher?: typeof fetch): Promise<CohortDetailsDto> => {
		const id = cohortId.trim();
		const res = await FetchFromApi<{ cohortId: string; name: string; isActive: boolean }>(
			`cohorts/${encodeURIComponent(id)}/join`,
			{ method: 'POST' },
			fetcher
		);

		const joined = res.body;
		return await cohortApi.getById(joined.cohortId, fetcher);
	},

	leave: async (fetcher?: typeof fetch): Promise<unknown> => {
		const res = await FetchFromApi<unknown>('cohorts/leave', { method: 'POST' }, fetcher);
		return res.body;
	},

	rename: async (req: UpdateCohortRequest, fetcher?: typeof fetch): Promise<CohortDetailsDto> => {
		const id = req.cohortId.trim();
		const res = await FetchFromApi<{ cohortId: string; name: string; isActive: boolean }>(
			`cohorts/${encodeURIComponent(id)}`,
			{ method: 'PUT', body: JSON.stringify({ name: req.name }) },
			fetcher
		);
		const updated = res.body;
		return await cohortApi.getById(updated.cohortId, fetcher);
	},

	getMembersPage: async (
		cohortId: string,
		page = 1,
		pageSize = 50,
		fetcher?: typeof fetch
	): Promise<CohortMembersPageDto> => {
		const id = cohortId.trim();
		const sp = new URLSearchParams();
		sp.set('page', String(page));
		sp.set('pageSize', String(pageSize));

		const res = await FetchFromApi<CohortMembersPageDto>(
			`cohorts/${encodeURIComponent(id)}/members`,
			{ method: 'GET' },
			fetcher,
			sp
		);

		const b = res.body;
		return {
			page: b.page,
			pageSize: b.pageSize,
			totalCount: b.totalCount,
			items: (b.items ?? []).map((m: any) => ({
				userId: m.userId,
				userName: m.username ?? m.userName,
				userAvatarUrl: m.userAvatarUrl ?? null
			}))
		};
	},

	getAllMembers: async (cohortId: string, fetcher?: typeof fetch): Promise<CohortMemberDto[]> => {
		const first = await cohortApi.getMembersPage(cohortId, 1, 100, fetcher);
		const all = [...(first.items ?? [])];
		const total = first.totalCount ?? all.length;
		const pageSize = first.pageSize ?? 100;

		if (all.length >= total) return all;

		const totalPages = Math.ceil(total / pageSize);
		for (let p = 2; p <= totalPages; p++) {
			const next = await cohortApi.getMembersPage(cohortId, p, pageSize, fetcher);
			all.push(...(next.items ?? []));
			if (all.length >= total) break;
		}
		return all;
	},

	getActiveMembers: async (
		cohortId: string,
		fetcher?: typeof fetch
	): Promise<CohortActiveMemberDto[]> => {
		const id = cohortId.trim();
		const res = await FetchFromApi<{ items: any[] }>(
			`cohorts/${encodeURIComponent(id)}/active-members`,
			{ method: 'GET' },
			fetcher
		);

		const items = res.body?.items ?? [];
		return items.map((m: any) => ({
			userId: m.userId,
			userName: m.username ?? m.userName,
			userAvatarUrl: m.userAvatarUrl ?? null,
			lastSeenAt: m.lastSeenAt,
			isActive: !!m.isActive
		}));
	},

	getMessages: async (
		cohortId: string,
		opts?: { beforeCreatedAt?: string | null; pageSize?: number },
		fetcher?: typeof fetch
	): Promise<GetCohortMessagesResultDto> => {
		const id = cohortId.trim();
		const sp = new URLSearchParams();
		sp.set('pageSize', String(opts?.pageSize ?? 50));
		if (opts?.beforeCreatedAt) sp.set('beforeCreatedAt', opts.beforeCreatedAt);

		const res = await FetchFromApi<GetCohortMessagesResultDto>(
			`cohorts/${encodeURIComponent(id)}/messages`,
			{ method: 'GET' },
			fetcher,
			sp
		);

		const b = res.body;
		return {
			items: (b.items ?? []).map((m: any) => ({
				messageId: m.messageId,
				cohortId: m.cohortId,
				userId: m.userId,
				userName: m.userName ?? m.username,
				userAvatarUrl: m.userAvatarUrl ?? null,
				content: m.content ?? null,
				mediaType: m.mediaType,
				mediaUrl: m.mediaUrl ?? null,
				createdAt: m.createdAt,
				isMine: !!m.isMine
			})),
			nextCursor: b.nextCursor ?? null,
			hasMore: !!b.hasMore
		};
	},

	uploadChatMedia: async (
		cohortId: string,
		file: File,
		fetcher?: typeof fetch
	): Promise<UploadMediaResultDto> => {
		const id = cohortId.trim();
		const form = new FormData();
		form.append('file', file);
		const res = await FetchFromApi<UploadMediaResultDto>(
			`cohorts/${encodeURIComponent(id)}/chat/media`,
			{ method: 'POST', body: form },
			fetcher
		);
		return res.body;
	},

	sendMessageRest: async (
		cohortId: string,
		dto: SendMessageRequestDto,
		fetcher?: typeof fetch
	): Promise<SendMessageResultDto> => {
		const id = cohortId.trim();
		const res = await FetchFromApi<SendMessageResultDto>(
			`cohorts/${encodeURIComponent(id)}/chat/messages`,
			{ method: 'POST', body: JSON.stringify(dto) },
			fetcher
		);
		return res.body;
	},

	createChatConnection: (cohortId: string, handlers?: CohortChatConnectionHandlers) => {
		const origin = apiOriginFromApiUrl();
		const url = `${origin}/hubs/cohort-chat?cohortId=${encodeURIComponent(cohortId.trim())}`;

		const conn = new signalR.HubConnectionBuilder()
			.withUrl(url, { withCredentials: true })
			.withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
			.build();

		conn.on('ReceiveMessage', (msg: SendMessageResultDto) => {
			try {
				handlers?.onReceiveMessage?.(msg);
			} catch (err) {
				handlers?.onError?.(err);
			}
		});

		conn.on('PresenceUpdated', (update: PresenceUpdatedDto) => {
			try {
				handlers?.onPresenceUpdated?.(update);
			} catch (err) {
				handlers?.onError?.(err);
			}
		});

		conn.on('MessageRejected', (reason: string) => {
			try {
				handlers?.onMessageRejected?.(reason);
			} catch (err) {
				handlers?.onError?.(err);
			}
		});

		return conn;
	},

	sendViaHub: async (
		conn: signalR.HubConnection,
		dto: { cohortId: string } & SendMessageRequestDto
	) => {
		await conn.invoke('SendMessage', dto);
	},

	getLeaderboard: async (
		cohortId: string,
		fetcher?: typeof fetch
	): Promise<LeaderboardItemDto[]> => {
		const page = await userApi.getCohortLeaderboard(cohortId, 1, 100, fetcher);
		const entries = page.entries ?? [];
		return entries.map((e: UserLeaderboardEntryDto) => ({
			rank: e.rank,
			userId: e.userId,
			userName: e.username,
			experience: e.experience,
			amountSolved: e.amountSolved,
			userAvatarUrl: e.userAvatarUrl ?? null
		}));
	}
};
