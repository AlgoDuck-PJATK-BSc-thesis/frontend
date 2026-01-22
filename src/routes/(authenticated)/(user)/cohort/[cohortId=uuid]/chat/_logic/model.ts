import { createInfiniteQuery } from '@tanstack/svelte-query';
import { derived, get, writable, type Readable } from 'svelte/store';
import type { HubConnection } from '@microsoft/signalr';
import { tick } from 'svelte';
import type { CohortMemberDto } from '$lib/api/cohort';

import type { LocalMessage, PendingImage } from '../types';
import { addFiles, removeFile } from '../files';
import { rafTick } from '../util';

import { createChatSelectors } from './selectors';
import { createChatScroll } from './scroll';
import { createChatConnection } from './connection';
import { createStatusForMessage } from './status';

export const createCohortChatModel = (params: {
	cohortId: Readable<string>;
	defaultAvatar: string;
}) => {
	const cohortId = writable('');
	const unsubCohort = params.cohortId.subscribe((v) => cohortId.set((v ?? '').toString()));

	const message = writable('');
	const pendingImages = writable<PendingImage[]>([]);
	const liveMessages = writable<LocalMessage[]>([]);

	const conn = writable<HubConnection | null>(null);
	const currentUserId = writable<string | null>(null);

	const members = writable<CohortMemberDto[]>([]);
	const memberAvatarByUserId = writable<Record<string, string | null>>({});

	const readByCountByMessageId = writable<Record<string, number>>({});

	const queryOptionsStore = derived(cohortId, (id) => ({
		queryKey: ['cohortMessages', id] as const,
		enabled: !!id,
		initialPageParam: null as string | null,
		queryFn: async ({ pageParam }: { pageParam: string | null }) => {
			const clean = (id ?? '').toString().trim();
			return await (
				await import('$lib/api/cohort')
			).cohortApi.getMessages(clean, {
				beforeCreatedAt: pageParam,
				pageSize: 50
			});
		},
		getNextPageParam: (lastPage: any) => {
			const lp = lastPage as unknown as { hasMore?: boolean; nextCursor?: string | null };
			if (!lp.hasMore) return undefined;
			return lp.nextCursor ?? undefined;
		}
	}));

	const query = createInfiniteQuery(queryOptionsStore);

	const selectors = createChatSelectors({
		query,
		liveMessages,
		memberAvatarByUserId,
		defaultAvatar: params.defaultAvatar
	});

	const scroll = createChatScroll({
		cohortId,
		allMessages: selectors.allMessages,
		conn,
		query,
		rafTick,
		tick,
		onFetchOlder: async () => {
			const q = get(query);
			if (q?.hasNextPage && !q?.isFetchingNextPage) {
				await q.fetchNextPage?.();
			}
		}
	});

	const connection = createChatConnection({
		cohortId,
		message,
		pendingImages,
		liveMessages,
		conn,
		currentUserId,
		members,
		memberAvatarByUserId,
		readByCountByMessageId,
		onAfterReceive: () => {},
		onShouldScroll: () => scroll.computeNearBottom(),
		onScrollToBottom: (b) => {
			scroll.scrollToBottom(b);
		},
		onMarkRead: () => {
			scroll.markReadIfAppropriate();
		},
		onResetScrollMarkers: () => {
			scroll.resetReadMarkers();
		}
	});

	let detachConnSub: null | (() => void) = null;

	const onFiles = (files: File[]) => {
		pendingImages.update((arr) => addFiles(files, arr, (msg) => alert(msg)));
	};

	const onRemove = (id: string) => {
		pendingImages.update((arr) => removeFile(arr, id));
	};

	const statusForMessage = createStatusForMessage({
		allMessages: selectors.allMessages,
		readByCountByMessageId
	});

	const mount = async () => {
		if (detachConnSub) detachConnSub();
		detachConnSub = connection.mount();
		await scroll.mount();
	};

	const destroy = () => {
		if (detachConnSub) detachConnSub();
		detachConnSub = null;
		unsubCohort();
		scroll.destroy();
		const c = get(conn);
		if (c) {
			try {
				c.stop();
			} catch {}
		}
		conn.set(null);
	};

	return {
		message,
		pendingImages,
		runs: selectors.runs,
		statusForMessage,
		onFiles,
		onRemove,
		sendAll: connection.sendAll,
		mount,
		destroy
	};
};
