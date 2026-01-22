import type { cohortApi } from '$lib/api/cohort';
import type { CohortMemberDto } from '$lib/api/cohort';

export type MessagesPageDto = Awaited<ReturnType<(typeof cohortApi)['getMessages']>>;

export type PageMessageDto = {
	messageId: string;
	userId: string;
	userName: string;
	userAvatarUrl?: string | null;
	content?: string | null;
	mediaType: unknown;
	mediaUrl?: string | null;
	createdAt: string;
	isMine?: boolean;
};

export type DeliveryState = 'sending' | 'delivered' | 'read';

export type LocalMessage = {
	messageId: string;
	userId: string;
	userName: string;
	userAvatarUrl: string | null;
	content: string | null;
	mediaType: 'Text' | 'Image';
	mediaUrl: string | null;
	createdAt: string;
	isMine: boolean;
	clientMessageId?: string | null;
	deliveryState?: DeliveryState;
	readByCount?: number | null;
};

export type PendingImage = {
	id: string;
	file: File;
	previewUrl: string;
};

export type ChatRun = {
	userId: string;
	userName: string;
	isMine: boolean;
	avatarPath: string | null;
	timeLabel: string;
	items: LocalMessage[];
};

export type MemberMap = Record<string, string | null>;

export type MemberList = CohortMemberDto[];
