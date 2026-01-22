import type { InfiniteData } from '@tanstack/query-core';
import { derived, type Readable } from 'svelte/store';
import type { CohortMemberDto } from '$lib/api/cohort';
import type { ChatRun, LocalMessage, MessagesPageDto, PageMessageDto } from '../types';
import { normalizeMediaType, formatTime } from '../util';

export const createChatSelectors = (params: {
	query: Readable<any>;
	liveMessages: Readable<LocalMessage[]>;
	memberAvatarByUserId: Readable<Record<string, string | null>>;
	defaultAvatar: string;
}) => {
	const historyMessages = derived(params.query, ($q) => {
		const data = ($q?.data ?? undefined) as unknown as
			| InfiniteData<MessagesPageDto, string | null>
			| undefined;

		const pages = (data?.pages ?? []) as unknown as MessagesPageDto[];

		const all = pages.flatMap((p) => {
			const pp = p as unknown as { items?: PageMessageDto[] };
			return pp.items ?? [];
		});

		all.sort(
			(a: PageMessageDto, b: PageMessageDto) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);

		return all.map((m: PageMessageDto) => ({
			messageId: m.messageId,
			userId: m.userId,
			userName: m.userName,
			userAvatarUrl: (m.userAvatarUrl ?? null) as string | null,
			content: (m.content ?? null) as string | null,
			mediaType: normalizeMediaType(m.mediaType),
			mediaUrl: (m.mediaUrl ?? null) as string | null,
			createdAt: m.createdAt,
			isMine: !!m.isMine
		})) as LocalMessage[];
	});

	const allMessages = derived([historyMessages, params.liveMessages], ([$history, $live]) => {
		const merged = [...$history, ...$live];
		const byId = new Map<string, LocalMessage>();
		for (const m of merged) {
			if (!m.messageId) continue;
			byId.set(m.messageId, m);
		}
		const deduped = Array.from(byId.values());
		deduped.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		return deduped;
	});

	const groupRuns = (msgs: LocalMessage[], avatarMap: Record<string, string | null>): ChatRun[] => {
		const runs: ChatRun[] = [];
		for (const m of msgs) {
			const last = runs[runs.length - 1];
			if (last && last.userId === m.userId) {
				last.items.push(m);
				continue;
			}

			const avatar =
				m.userAvatarUrl ?? avatarMap[m.userId] ?? (m.isMine ? null : params.defaultAvatar);

			runs.push({
				userId: m.userId,
				userName: m.isMine ? 'you' : m.userName,
				isMine: m.isMine,
				avatarPath: avatar ?? null,
				timeLabel: formatTime(m.createdAt),
				items: [m]
			});
		}
		return runs;
	};

	const runs = derived([allMessages, params.memberAvatarByUserId], ([$all, $map]) => {
		return groupRuns($all, $map);
	});

	return { historyMessages, allMessages, runs };
};
