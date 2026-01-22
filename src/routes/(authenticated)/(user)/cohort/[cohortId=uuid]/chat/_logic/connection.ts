import { get, type Writable } from 'svelte/store';
import type { HubConnection } from '@microsoft/signalr';
import { cohortApi, type SendMessageResultDto, type CohortMemberDto } from '$lib/api/cohort';
import { authApi } from '$lib/api/auth';
import type { LocalMessage, PendingImage } from '../types';
import { normalizeMediaType, extractSignalRError, newClientMessageId } from '../util';
import { clearFiles } from '../files';

export const createChatConnection = (params: {
	cohortId: Writable<string>;
	message: Writable<string>;
	pendingImages: Writable<PendingImage[]>;
	liveMessages: Writable<LocalMessage[]>;
	conn: Writable<HubConnection | null>;
	currentUserId: Writable<string | null>;
	members: Writable<CohortMemberDto[]>;
	memberAvatarByUserId: Writable<Record<string, string | null>>;
	readByCountByMessageId: Writable<Record<string, number>>;
	onAfterReceive: () => void;
	onShouldScroll: () => boolean;
	onScrollToBottom: (behavior: ScrollBehavior) => void;
	onMarkRead: () => void;
	onResetScrollMarkers: () => void;
}) => {
	let lastAttemptedText: string | null = null;
	let lastAttemptedImages: PendingImage[] = [];
	let lastRejectRestoreArmed = false;

	const refreshMembers = async () => {
		const cohortId = get(params.cohortId);
		if (!cohortId) return;
		try {
			const list = await cohortApi.getAllMembers(cohortId);
			params.members.set(list);
			const map: Record<string, string | null> = {};
			for (const m of list) map[m.userId] = m.userAvatarUrl ?? null;
			params.memberAvatarByUserId.set(map);
		} catch {}
	};

	const showRejection = (reason: unknown) => {
		const msg =
			typeof reason === 'string' && reason.trim()
				? reason.trim()
				: 'This message violates our content rules.';
		alert(msg);

		if (lastRejectRestoreArmed) {
			const msgText = get(params.message);
			const imgs = get(params.pendingImages);

			if (!msgText.trim() && lastAttemptedText && lastAttemptedText.trim()) {
				params.message.set(lastAttemptedText);
			}

			if (imgs.length === 0 && lastAttemptedImages.length > 0) {
				params.pendingImages.set(lastAttemptedImages);
			}

			lastRejectRestoreArmed = false;
		}
	};

	const upsertLiveByClientId = (clientMessageId: string, next: LocalMessage) => {
		let did = false;
		params.liveMessages.update((arr) => {
			const idx = arr.findIndex((x) => x.clientMessageId === clientMessageId);
			if (idx < 0) return arr;
			const copy = [...arr];
			copy[idx] = next;
			did = true;
			return copy;
		});
		return did;
	};

	const upsertLiveByMessageId = (messageId: string, next: LocalMessage) => {
		let did = false;
		params.liveMessages.update((arr) => {
			const idx = arr.findIndex((x) => x.messageId === messageId);
			if (idx < 0) return arr;
			const copy = [...arr];
			copy[idx] = next;
			did = true;
			return copy;
		});
		return did;
	};

	const onReceive = (msg: SendMessageResultDto & { readByCount?: number | null }) => {
		const mine = get(params.currentUserId) ? msg.userId === get(params.currentUserId) : false;

		const local: LocalMessage = {
			messageId: msg.messageId,
			userId: msg.userId,
			userName: msg.userName,
			userAvatarUrl: msg.userAvatarUrl ?? null,
			content: msg.content ?? null,
			mediaType: normalizeMediaType(msg.mediaType as unknown),
			mediaUrl: msg.mediaUrl ?? null,
			createdAt: msg.createdAt,
			isMine: mine,
			clientMessageId: (msg as any).clientMessageId ?? null,
			deliveryState: mine ? 'delivered' : undefined,
			readByCount: mine ? (msg.readByCount ?? null) : null
		};

		const shouldScroll = params.onShouldScroll();

		if (mine && local.clientMessageId) {
			const replaced = upsertLiveByClientId(local.clientMessageId, local);
			if (!replaced) params.liveMessages.update((arr) => [...arr, local]);
		} else {
			const replaced = upsertLiveByMessageId(local.messageId, local);
			if (!replaced) params.liveMessages.update((arr) => [...arr, local]);
		}

		if (mine) {
			const c = local.readByCount ?? null;
			if (c && c > 0) {
				params.readByCountByMessageId.update((m) => ({ ...m, [local.messageId]: c }));
			}
		}

		if (shouldScroll) params.onScrollToBottom('smooth');

		params.onMarkRead();
		params.onAfterReceive();
	};

	const ensureConnected = async () => {
		const c = get(params.conn);
		if (!c) throw new Error('Chat connection unavailable.');

		const state = () => c.state;
		if (state() === 'Connected') return;

		if (state() === 'Connecting' || state() === 'Reconnecting') {
			for (let i = 0; i < 30; i++) {
				await new Promise((r) => setTimeout(r, 100));
				if (state() === 'Connected') return;
				if (state() === 'Disconnected') break;
			}
		}

		if (state() !== 'Connected') {
			await c.start();
		}
	};

	const createOptimisticText = (text: string, clientMessageId: string): LocalMessage => {
		const now = new Date().toISOString();
		return {
			messageId: `local-${clientMessageId}`,
			userId: get(params.currentUserId) ?? 'pending',
			userName: 'you',
			userAvatarUrl: null,
			content: text,
			mediaType: 'Text',
			mediaUrl: null,
			createdAt: now,
			isMine: true,
			clientMessageId,
			deliveryState: 'sending',
			readByCount: null
		};
	};

	const createOptimisticImage = (previewUrl: string, clientMessageId: string): LocalMessage => {
		const now = new Date().toISOString();
		return {
			messageId: `local-${clientMessageId}`,
			userId: get(params.currentUserId) ?? 'pending',
			userName: 'you',
			userAvatarUrl: null,
			content: '',
			mediaType: 'Image',
			mediaUrl: previewUrl,
			createdAt: now,
			isMine: true,
			clientMessageId,
			deliveryState: 'sending',
			readByCount: null
		};
	};

	const sendTextOptimistic = async (text: string) => {
		const cohortId = get(params.cohortId);
		const trimmed = text.trim();
		if (!cohortId || !trimmed) return;

		await ensureConnected();

		const c = get(params.conn);
		if (!c) return;

		const clientMessageId = newClientMessageId();
		const local = createOptimisticText(trimmed, clientMessageId);
		const shouldScroll = params.onShouldScroll();

		params.liveMessages.update((arr) => [...arr, local]);
		if (shouldScroll) params.onScrollToBottom('smooth');

		try {
			await c.invoke('SendMessage', {
				cohortId,
				content: trimmed,
				mediaType: 0,
				clientMessageId
			});
		} catch (e) {
			params.liveMessages.update((arr) => arr.filter((m) => m.clientMessageId !== clientMessageId));
			showRejection(extractSignalRError(e));
			throw e;
		}
	};

	const sendImageOptimistic = async (file: File, previewUrl: string) => {
		const cohortId = get(params.cohortId);
		if (!cohortId) return;

		await ensureConnected();

		const c = get(params.conn);
		if (!c) return;

		const clientMessageId = newClientMessageId();
		const local = createOptimisticImage(previewUrl, clientMessageId);
		const shouldScroll = params.onShouldScroll();

		params.liveMessages.update((arr) => [...arr, local]);
		if (shouldScroll) params.onScrollToBottom('smooth');

		try {
			const uploaded = await cohortApi.uploadChatMedia(cohortId, file);
			await c.invoke('SendMessage', {
				cohortId,
				content: '',
				mediaType: 1,
				mediaKey: uploaded.mediaKey,
				mediaContentType: uploaded.contentType,
				clientMessageId
			});
		} catch (e) {
			params.liveMessages.update((arr) => arr.filter((m) => m.clientMessageId !== clientMessageId));
			showRejection(extractSignalRError(e));
			throw e;
		}
	};

	const sendAll = async () => {
		const imgs = get(params.pendingImages);
		const text = get(params.message);

		if (imgs.length === 0 && text.trim().length === 0) return;

		lastAttemptedText = text;
		lastAttemptedImages = imgs;
		lastRejectRestoreArmed = true;

		const sentFromNearBottom = params.onShouldScroll();

		let didClearText = false;

		if (text.trim().length > 0) {
			params.message.set('');
			didClearText = true;
		}

		if (imgs.length > 0) {
			params.pendingImages.set([]);
		}

		try {
			if (imgs.length > 0) {
				for (const p of imgs) {
					await sendImageOptimistic(p.file, p.previewUrl);
					try {
						URL.revokeObjectURL(p.previewUrl);
					} catch {}
				}
			}

			if (text.trim().length > 0) {
				await sendTextOptimistic(text);
			}

			lastRejectRestoreArmed = false;
			lastAttemptedText = null;
			lastAttemptedImages = [];

			if (sentFromNearBottom) {
				params.onScrollToBottom('smooth');
			}
		} catch {
			if (didClearText && lastAttemptedText && lastAttemptedText.trim()) {
				params.message.set(lastAttemptedText);
			}

			if (imgs.length > 0) {
				params.pendingImages.set(imgs);
			}

			lastRejectRestoreArmed = false;
		}
	};

	let stopConn: null | (() => Promise<void>) = null;
	let token = 0;

	const connectForCohort = async (cohortId: string) => {
		const t = ++token;

		if (stopConn) {
			await stopConn();
			stopConn = null;
		}

		params.onResetScrollMarkers();

		params.liveMessages.set([]);
		params.readByCountByMessageId.set({});

		clearFiles(get(params.pendingImages));
		params.pendingImages.set([]);

		params.message.set('');

		params.currentUserId.set(null);

		if (!cohortId) {
			params.conn.set(null);
			return;
		}

		try {
			const me = await authApi.me();
			if (t === token) params.currentUserId.set(me.id);
		} catch {
			if (t === token) params.currentUserId.set(null);
		}

		await refreshMembers();

		const nextConn = cohortApi.createChatConnection(cohortId, {
			onReceiveMessage: (msg) => {
				onReceive(msg as any);
			}
		});

		nextConn.on('MessageRejected', (reason: unknown) => {
			showRejection(reason);
		});

		nextConn.on('ReadReceiptUpdated', (payload: any) => {
			const messageId = (payload?.messageId ?? null) as string | null;
			const readByCount = (payload?.readByCount ?? null) as number | null;

			if (!messageId) return;
			if (!readByCount || readByCount <= 0) return;

			params.readByCountByMessageId.update((m) => {
				const prev = m[messageId] ?? 0;
				if (readByCount > prev) return { ...m, [messageId]: readByCount };
				return m;
			});
		});

		params.conn.set(nextConn);

		try {
			await nextConn.start();
		} catch {
			if (t === token) params.conn.set(null);
			return;
		}

		stopConn = async () => {
			try {
				await nextConn.stop();
			} catch {}
		};

		params.onMarkRead();
	};

	const mount = () => {
		const unsub = params.cohortId.subscribe((id) => {
			connectForCohort((id ?? '').toString().trim());
		});

		return () => {
			unsub();
		};
	};

	return { mount, sendAll, refreshMembers, showRejection };
};
