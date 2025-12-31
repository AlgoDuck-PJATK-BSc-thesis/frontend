<script lang="ts">
	import PixelFrameChat from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameChat.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import { highlightJava } from '../../../../../../Utils/highlight';
	import { cohortApi, type SendMessageResultDto, type CohortMemberDto } from '$lib/api/cohort';
	import { authApi } from '$lib/api/auth';
	import { HubConnectionState, type HubConnection } from '@microsoft/signalr';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import type { InfiniteData } from '@tanstack/query-core';
	import { derived, get } from 'svelte/store';
	import { page as pageStore } from '$app/stores';
	import { page as pageState } from '$app/state';
	import { tick } from 'svelte';

	const isBrowser = typeof window !== 'undefined';

	type MessagesPageDto = Awaited<ReturnType<(typeof cohortApi)['getMessages']>>;

	type PageMessageDto = {
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

	const cohortId = $derived(pageState.params.cohortId ?? '');

	const cohortIdStore = derived(
		pageStore,
		($p) => ($p.params as Record<string, string | undefined>).cohortId ?? ''
	);

	let message = $state('');
	let textareaRef = $state<HTMLTextAreaElement | null>(null);
	let textResize = $state(48);

	let conn = $state<HubConnection | null>(null);
	let currentUserId = $state<string | null>(null);

	let members = $state<CohortMemberDto[]>([]);
	let memberAvatarByUserId = $state<Record<string, string | null>>({});

	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55642.png`;

	type DeliveryState = 'sending' | 'delivered' | 'read';

	type LocalMessage = {
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

	type PendingImage = {
		id: string;
		file: File;
		previewUrl: string;
	};

	let pendingImages = $state<PendingImage[]>([]);
	let liveMessages = $state<LocalMessage[]>([]);
	let didInitialScroll = $state(false);
	let initialScrollToken = $state(0);

	let fileInput = $state<HTMLInputElement | null>(null);
	let detachScroll = $state<null | (() => void)>(null);

	let lastAttemptedText = $state<string | null>(null);
	let lastAttemptedImages = $state<PendingImage[]>([]);
	let lastRejectRestoreArmed = $state(false);

	let readByCountByMessageId = $state<Record<string, number>>({});

	let lastMarkedReadMessageId = $state<string | null>(null);
	let lastMarkedReadAtMs = $state(0);

	const scrollStorageKey = $derived.by(() => (cohortId ? `cohort-chat-scroll:${cohortId}` : ''));

	const rafTick = () =>
		new Promise<void>((resolve) => {
			if (!isBrowser) return resolve();
			requestAnimationFrame(() => resolve());
		});

	const normalizeMediaType = (mt: unknown): 'Text' | 'Image' => {
		if (mt === 1) return 'Image';
		if (typeof mt === 'string') {
			const v = mt.toLowerCase();
			if (v === 'image') return 'Image';
		}
		return 'Text';
	};

	const extractSignalRError = (e: unknown): string => {
		const raw = e instanceof Error ? e.message : typeof e === 'string' ? e : '';
		const msg = (raw ?? '').toString();
		const hubParts = msg.split('HubException:');
		if (hubParts.length > 1) return hubParts.slice(1).join('HubException:').trim() || msg.trim();
		const idx = msg.indexOf('ChatValidationException:');
		if (idx >= 0) return msg.slice(idx + 'ChatValidationException:'.length).trim() || msg.trim();
		const idx2 = msg.indexOf('Exception:');
		if (idx2 >= 0) return msg.slice(idx2 + 'Exception:'.length).trim() || msg.trim();
		return msg.trim() || 'Failed to send message.';
	};

	const newClientMessageId = () => {
		if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
		return `${Date.now()}-${Math.random()}`;
	};

	const queryOptionsStore = derived(cohortIdStore, (id) => ({
		queryKey: ['cohortMessages', id] as const,
		enabled: !!id,
		initialPageParam: null as string | null,
		queryFn: async ({ pageParam }: { pageParam: string | null }) => {
			return await cohortApi.getMessages(id, { beforeCreatedAt: pageParam, pageSize: 50 });
		},
		getNextPageParam: (lastPage: MessagesPageDto) => {
			const lp = lastPage as unknown as { hasMore?: boolean; nextCursor?: string | null };
			if (!lp.hasMore) return undefined;
			return lp.nextCursor ?? undefined;
		}
	}));

	const query = createInfiniteQuery(queryOptionsStore);

	const historyMessages = $derived.by(() => {
		const data = ($query.data ?? undefined) as unknown as
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

	const allMessages = $derived.by(() => {
		const merged = [...historyMessages, ...liveMessages];
		const byId = new Map<string, LocalMessage>();
		for (const m of merged) {
			if (!m.messageId) continue;
			byId.set(m.messageId, m);
		}
		const deduped = Array.from(byId.values());
		deduped.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		return deduped;
	});

	type ChatRun = {
		userId: string;
		userName: string;
		isMine: boolean;
		avatarPath: string | null;
		timeLabel: string;
		items: LocalMessage[];
	};

	const formatTime = (iso: string) =>
		new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	const groupRuns = (msgs: LocalMessage[]): ChatRun[] => {
		const runs: ChatRun[] = [];
		for (const m of msgs) {
			const last = runs[runs.length - 1];
			if (last && last.userId === m.userId) {
				last.items.push(m);
				continue;
			}

			const avatar =
				m.userAvatarUrl ?? memberAvatarByUserId[m.userId] ?? (m.isMine ? null : defaultAvatar);

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

	const runs = $derived.by(() => groupRuns(allMessages));

	const getScrollEl = () =>
		isBrowser ? (document.getElementById('chat-scroll') as HTMLDivElement | null) : null;

	const computeNearBottom = () => {
		const el = getScrollEl();
		if (!el) return true;
		const gap = el.scrollHeight - (el.scrollTop + el.clientHeight);
		return gap < 140;
	};

	const persistScroll = () => {
		if (!isBrowser) return;
		const key = scrollStorageKey;
		if (!key) return;
		const el = getScrollEl();
		if (!el) return;

		const payload = {
			top: el.scrollTop,
			atBottom: computeNearBottom()
		};

		try {
			sessionStorage.setItem(key, JSON.stringify(payload));
		} catch {}
	};

	const scrollToBottom = async (behavior: ScrollBehavior = 'auto') => {
		if (!isBrowser) return;
		await tick();
		await rafTick();
		const el = getScrollEl();
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior });
		await rafTick();
		const el2 = getScrollEl();
		if (!el2) return;
		el2.scrollTo({ top: el2.scrollHeight, behavior: 'auto' });
		persistScroll();
	};

	const restoreScroll = async (): Promise<{ hadPayload: boolean; wantsBottom: boolean }> => {
		if (!isBrowser) return { hadPayload: false, wantsBottom: true };
		const key = scrollStorageKey;
		if (!key) return { hadPayload: false, wantsBottom: true };

		let payload: { top: number; atBottom: boolean } | null = null;
		try {
			const raw = sessionStorage.getItem(key);
			if (raw) payload = JSON.parse(raw) as { top: number; atBottom: boolean };
		} catch {
			payload = null;
		}

		if (!payload) {
			await scrollToBottom('auto');
			return { hadPayload: false, wantsBottom: true };
		}

		if (payload.atBottom) {
			await scrollToBottom('auto');
			return { hadPayload: true, wantsBottom: true };
		}

		await tick();
		await rafTick();
		const el = getScrollEl();
		if (el) el.scrollTop = payload.top;
		return { hadPayload: true, wantsBottom: false };
	};

	const getLastNonLocalMessageId = () => {
		const msgs = allMessages;
		for (let i = msgs.length - 1; i >= 0; i--) {
			const id = msgs[i]?.messageId ?? '';
			if (!id) continue;
			if (id.startsWith('local-')) continue;
			return id;
		}
		return null;
	};

	const markReadIfAppropriate = async () => {
		if (!isBrowser) return;
		if (!cohortId) return;
		if (document.visibilityState !== 'visible') return;
		if (!computeNearBottom()) return;

		const c = conn;
		if (!c) return;
		if (c.state !== HubConnectionState.Connected) return;

		const messageId = getLastNonLocalMessageId();
		if (!messageId) return;

		const nowMs = Date.now();
		if (lastMarkedReadMessageId === messageId && nowMs - lastMarkedReadAtMs < 1500) return;

		lastMarkedReadMessageId = messageId;
		lastMarkedReadAtMs = nowMs;

		try {
			await c.invoke('MarkReadUpTo', messageId);
		} catch {}
	};

	$effect(() => {
		if (!isBrowser) return;
		if (!cohortId) return;
		const q = $query;
		if (!didInitialScroll && q.isSuccess) {
			didInitialScroll = true;
			const token = (initialScrollToken = initialScrollToken + 1);
			(async () => {
				await tick();
				await rafTick();
				const info = await restoreScroll();
				if (token !== initialScrollToken) return;

				await rafTick();
				const el = getScrollEl();
				if (el && el.scrollTop === 0 && (info.wantsBottom || !info.hadPayload)) {
					await scrollToBottom('auto');
				}

				if (token !== initialScrollToken) return;
				if (info.wantsBottom) {
					await new Promise<void>((r) => setTimeout(r, 120));
					if (token !== initialScrollToken) return;
					await scrollToBottom('auto');
					await new Promise<void>((r) => setTimeout(r, 400));
					if (token !== initialScrollToken) return;
					await scrollToBottom('auto');
				}

				await markReadIfAppropriate();
			})();
		}
	});

	const attachLazyLoad = () => {
		if (!isBrowser) return null;
		const el = getScrollEl();
		if (!el) return null;

		let raf = 0;

		const onScroll = async () => {
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				persistScroll();
			});

			if (computeNearBottom()) {
				markReadIfAppropriate();
			}

			if (el.scrollTop > 0) return;

			const q = get(query);
			if (!q.hasNextPage) return;
			if (q.isFetchingNextPage) return;

			const prevHeight = el.scrollHeight;
			await q.fetchNextPage();
			requestAnimationFrame(() => {
				const nextHeight = el.scrollHeight;
				el.scrollTop = nextHeight - prevHeight;
				persistScroll();
			});
		};

		const onPageHide = () => {
			persistScroll();
		};

		const onVisibility = () => {
			if (document.visibilityState === 'hidden') persistScroll();
			if (document.visibilityState === 'visible') markReadIfAppropriate();
		};

		el.addEventListener('scroll', onScroll);
		window.addEventListener('pagehide', onPageHide);
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			if (raf) cancelAnimationFrame(raf);
			el.removeEventListener('scroll', onScroll);
			window.removeEventListener('pagehide', onPageHide);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	};

	const refreshMembers = async () => {
		if (!cohortId) return;
		try {
			members = await cohortApi.getAllMembers(cohortId);
			const map: Record<string, string | null> = {};
			for (const m of members) map[m.userId] = m.userAvatarUrl ?? null;
			memberAvatarByUserId = map;
		} catch {}
	};

	const showRejection = (reason: unknown) => {
		const msg =
			typeof reason === 'string' && reason.trim()
				? reason.trim()
				: 'This message violates our content rules.';
		alert(msg);

		if (lastRejectRestoreArmed) {
			if (!message.trim() && lastAttemptedText && lastAttemptedText.trim()) {
				message = lastAttemptedText;
				resizeTextarea();
			}

			if (pendingImages.length === 0 && lastAttemptedImages.length > 0) {
				pendingImages = lastAttemptedImages;
			}

			lastRejectRestoreArmed = false;
		}
	};

	const upsertLiveByClientId = (clientMessageId: string, next: LocalMessage) => {
		const idx = liveMessages.findIndex((x) => x.clientMessageId === clientMessageId);
		if (idx >= 0) {
			const copy = [...liveMessages];
			copy[idx] = next;
			liveMessages = copy;
			return true;
		}
		return false;
	};

	const upsertLiveByMessageId = (messageId: string, next: LocalMessage) => {
		const idx = liveMessages.findIndex((x) => x.messageId === messageId);
		if (idx >= 0) {
			const copy = [...liveMessages];
			copy[idx] = next;
			liveMessages = copy;
			return true;
		}
		return false;
	};

	const onReceive = (msg: SendMessageResultDto & { readByCount?: number | null }) => {
		const mine = currentUserId ? msg.userId === currentUserId : false;

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

		const shouldScroll = computeNearBottom();

		if (mine && local.clientMessageId) {
			const replaced = upsertLiveByClientId(local.clientMessageId, local);
			if (!replaced) liveMessages = [...liveMessages, local];
		} else {
			const replaced = upsertLiveByMessageId(local.messageId, local);
			if (!replaced) liveMessages = [...liveMessages, local];
		}

		if (mine) {
			const c = local.readByCount ?? null;
			if (c && c > 0) {
				readByCountByMessageId = { ...readByCountByMessageId, [local.messageId]: c };
			}
		}

		if (shouldScroll) scrollToBottom('smooth');

		markReadIfAppropriate();
	};

	const mineTailInfo = $derived.by(() => {
		const msgs = allMessages;
		const tail: LocalMessage[] = [];
		for (let i = msgs.length - 1; i >= 0; i--) {
			const m = msgs[i];
			if (!m.isMine) break;
			tail.unshift(m);
		}

		const last = tail.length > 0 ? tail[tail.length - 1] : null;

		let lastPending: LocalMessage | null = null;
		for (let i = tail.length - 1; i >= 0; i--) {
			if (tail[i].deliveryState === 'sending') {
				lastPending = tail[i];
				break;
			}
		}

		const statusTarget = lastPending ?? last;
		const ids = new Set(tail.map((m) => m.messageId));

		return {
			ids,
			statusTargetId: statusTarget?.messageId ?? null,
			statusTarget
		};
	});

	const statusForMessage = (m: LocalMessage) => {
		const info = mineTailInfo;
		if (!m.isMine) return null;
		if (!info.ids.has(m.messageId)) return null;
		if (!info.statusTargetId) return null;
		if (info.statusTargetId !== m.messageId) return null;

		const t = info.statusTarget;
		if (!t) return null;

		if (t.deliveryState === 'sending') return { kind: 'sending' as const };

		const fromMap = readByCountByMessageId[m.messageId];
		const fromMsg = t.readByCount ?? null;
		const c = typeof fromMap === 'number' ? fromMap : (fromMsg ?? null);

		if (c && c > 0) return { kind: 'read' as const, count: c };

		return { kind: 'delivered' as const };
	};

	const ensureConnected = async () => {
		const c = conn;
		if (!c) throw new Error('Chat connection unavailable.');

		const getState = () => c.state as HubConnectionState;
		if (getState() === HubConnectionState.Connected) return;

		const s0 = getState();
		if (s0 === HubConnectionState.Connecting || s0 === HubConnectionState.Reconnecting) {
			for (let i = 0; i < 30; i++) {
				await new Promise((r) => setTimeout(r, 100));
				const s = getState();
				if (s === HubConnectionState.Connected) return;
				if (s === HubConnectionState.Disconnected) break;
			}
		}

		if (getState() !== HubConnectionState.Connected) {
			await c.start();
		}
	};

	const createOptimisticText = (text: string, clientMessageId: string): LocalMessage => {
		const now = new Date().toISOString();
		return {
			messageId: `local-${clientMessageId}`,
			userId: currentUserId ?? 'pending',
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
			userId: currentUserId ?? 'pending',
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
		const trimmed = text.trim();
		if (!trimmed) return;
		await ensureConnected();
		const c = conn;
		if (!c) return;

		const clientMessageId = newClientMessageId();
		const local = createOptimisticText(trimmed, clientMessageId);
		const shouldScroll = computeNearBottom();
		liveMessages = [...liveMessages, local];
		if (shouldScroll) scrollToBottom('smooth');

		try {
			await c.invoke('SendMessage', {
				cohortId,
				content: trimmed,
				mediaType: 0,
				clientMessageId
			});
		} catch (e) {
			liveMessages = liveMessages.filter((m) => m.clientMessageId !== clientMessageId);
			showRejection(extractSignalRError(e));
			throw e;
		}
	};

	const sendImageOptimistic = async (file: File, previewUrl: string) => {
		await ensureConnected();
		const c = conn;
		if (!c) return;

		const clientMessageId = newClientMessageId();
		const local = createOptimisticImage(previewUrl, clientMessageId);
		const shouldScroll = computeNearBottom();
		liveMessages = [...liveMessages, local];
		if (shouldScroll) scrollToBottom('smooth');

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
			liveMessages = liveMessages.filter((m) => m.clientMessageId !== clientMessageId);
			showRejection(extractSignalRError(e));
			throw e;
		}
	};

	async function sendAll() {
		const imgs = pendingImages;
		const text = message;

		if (imgs.length === 0 && text.trim().length === 0) return;

		lastAttemptedText = text;
		lastAttemptedImages = imgs;
		lastRejectRestoreArmed = true;

		const sentFromNearBottom = computeNearBottom();

		let didClearText = false;

		if (text.trim().length > 0) {
			message = '';
			didClearText = true;
			resizeTextarea();
		}

		if (imgs.length > 0) {
			pendingImages = [];
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
				scrollToBottom('smooth');
			}
		} catch {
			if (didClearText && lastAttemptedText && lastAttemptedText.trim()) {
				message = lastAttemptedText;
				resizeTextarea();
			}

			if (imgs.length > 0) {
				pendingImages = imgs;
			}

			lastRejectRestoreArmed = false;
		}
	}

	function openPicker() {
		if (fileInput) {
			try {
				fileInput.value = '';
			} catch {}
		}
		fileInput?.click();
	}

	const inferContentType = (name: string): string | null => {
		const lower = (name ?? '').toLowerCase();
		if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
		if (lower.endsWith('.png')) return 'image/png';
		if (lower.endsWith('.webp')) return 'image/webp';
		if (lower.endsWith('.gif')) return 'image/gif';
		return null;
	};

	function addFiles(files: File[]) {
		const next: PendingImage[] = [];

		for (const file of files) {
			let f = file;

			if (!f.type) {
				const lower = (f.name ?? '').toLowerCase();
				if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
					alert('HEIC/HEIF images are not supported. Please convert to JPG/PNG/WebP.');
					continue;
				}

				const inferred = inferContentType(f.name);
				if (!inferred) continue;
				f = new File([f], f.name, { type: inferred });
			}

			if (!f.type.startsWith('image/')) continue;

			const id =
				typeof crypto !== 'undefined' && 'randomUUID' in crypto
					? crypto.randomUUID()
					: `${Date.now()}-${Math.random()}`;

			const previewUrl = URL.createObjectURL(f);
			next.push({ id, file: f, previewUrl });
		}

		if (next.length > 0) pendingImages = [...pendingImages, ...next];
	}

	function removePending(id: string) {
		const found = pendingImages.find((p) => p.id === id);
		if (found) {
			try {
				URL.revokeObjectURL(found.previewUrl);
			} catch {}
		}
		pendingImages = pendingImages.filter((p) => p.id !== id);
	}

	async function onPickImage(e: Event) {
		const target = e.currentTarget as HTMLInputElement | null;
		if (!target) return;

		const copied = target.files ? Array.from(target.files) : [];
		try {
			target.value = '';
		} catch {}

		if (copied.length === 0) return;
		addFiles(copied);
	}

	$effect(() => {
		if (!cohortId) return;

		let active = true;

		(async () => {
			try {
				const me = await authApi.me();
				if (active) currentUserId = me.id;
			} catch {
				if (active) currentUserId = null;
			}

			await refreshMembers();

			if (detachScroll) detachScroll();
			detachScroll = attachLazyLoad();

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

				const prev = readByCountByMessageId[messageId] ?? 0;
				if (readByCount > prev) {
					readByCountByMessageId = { ...readByCountByMessageId, [messageId]: readByCount };
				}
			});

			const prevConn = conn;
			conn = nextConn;

			if (prevConn) {
				try {
					await prevConn.stop();
				} catch {}
			}

			try {
				await nextConn.start();
			} catch {
				if (active) conn = null;
				return;
			}

			await markReadIfAppropriate();
		})();

		return () => {
			active = false;

			didInitialScroll = false;

			if (detachScroll) detachScroll();
			detachScroll = null;

			const c = conn;
			conn = null;

			if (c) {
				try {
					c.stop();
				} catch {}
			}

			const imgs = pendingImages;
			pendingImages = [];
			for (const p of imgs) {
				try {
					URL.revokeObjectURL(p.previewUrl);
				} catch {}
			}

			liveMessages = [];
			readByCountByMessageId = {};
			lastMarkedReadMessageId = null;
			lastMarkedReadAtMs = 0;
			lastAttemptedText = null;
			lastAttemptedImages = [];
			lastRejectRestoreArmed = false;
		};
	});

	async function renderMessage(text: string): Promise<string> {
		const segments: string[] = [];
		const codeBlockRegex = /```(\w*)\r?\n([^]*?)```/g;

		let lastIndex = 0;

		for (const match of text.matchAll(codeBlockRegex)) {
			const fullMatch = match[0];
			const lang = match[1];
			const code = match[2];
			const start = match.index || 0;

			if (start > lastIndex) {
				const before = text.slice(lastIndex, start);
				segments.push(await renderInlineAndText(before));
			}

			if (lang.toLowerCase() === 'java') {
				segments.push(
					`<div class="p-2 bg-[color:#0d0f14] text-[color:var(--color-text)] overflow-auto rounded text-sm">${highlightJava(code)}</div>`
				);
			} else {
				segments.push(
					`<pre class="block w-full whitespace-pre-wrap font-mono text-sm bg-[color:var(--color-bg)] text-[color:var(--color-text)] p-2 rounded overflow-auto">${escapeHtml(code)}</pre>`
				);
			}
			lastIndex = start + fullMatch.length;
		}

		if (lastIndex < text.length) {
			const after = text.slice(lastIndex);
			segments.push(await renderInlineAndText(after));
		}

		return segments.join('');
	}

	async function renderInlineAndText(raw: string): Promise<string> {
		let escaped = escapeHtml(raw);

		const inlinePlaceholders: string[] = [];
		escaped = escaped.replace(/`([^`]+?)`/g, (_m, p1) => {
			const index = inlinePlaceholders.length;
			inlinePlaceholders.push(
				`<code class="px-1 py-1 bg-[color:var(--color-bg)] text-[color:var(--color-text)] font-mono rounded">${escapeHtml(p1)}</code>`
			);
			return `__INLINE_${index}__`;
		});

		escaped = escaped.replace(/\n/g, '<br>');

		inlinePlaceholders.forEach((code, i) => {
			escaped = escaped.replace(`__INLINE_${i}__`, code);
		});

		return escaped;
	}

	function escapeHtml(str: string): string {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	function resizeTextarea() {
		if (!textareaRef) return;

		const lineHeight = 20;
		const padding = 8;
		const maxHeight = lineHeight * 4 + padding * 2;

		textareaRef.style.height = 'auto';
		const scrollHeight = textareaRef.scrollHeight;
		const finalHeight = Math.min(scrollHeight, maxHeight);
		textResize = finalHeight;
	}
</script>

<div class="relative mt-[3rem] mr-2 ml-[3rem] w-fit">
	<div class=" -mt-[1rem] mb-[1rem] flex justify-center">
		<h1
			class="ocr-outline ocr-title isolate [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Chat
		</h1>
	</div>
	<PixelFrameSimple
		className="h-[74vh] w-[62vw] ml-1 mt-1 mr-6 z-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<div class="flex h-full w-full flex-col">
			<div
				id="chat-scroll"
				class="flex h-[calc(75vh-6rem)] w-full flex-col overflow-y-auto px-6 py-6"
			>
				{#each runs as run, i}
					<div
						class={`flex w-full ${run.isMine ? 'justify-end' : 'justify-start'} ${i > 0 ? 'mt-[1rem]' : ''}`}
					>
						{#if !run.isMine}
							<div class="relative mt-[1.3rem] mr-2 h-12 w-12 shrink-0">
								<div
									class="h-full w-full overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
								>
									<CloudfrontImage
										path={run.avatarPath ? run.avatarPath : defaultAvatar}
										cls="h-full w-full -translate-x-[-15%] -translate-y-[-5%] scale-[1.5] object-cover object-[left_top]"
									/>
								</div>
							</div>
						{/if}

						<div class={`flex w-full flex-col gap-2 ${run.isMine ? 'items-end' : 'items-start'}`}>
							<span class="text-xs text-[color:var(--color-landingpage-subtitle)]">
								{run.userName}
								{run.timeLabel}
							</span>

							{#each run.items as m}
								<div class={`flex w-full flex-col ${run.isMine ? 'items-end' : 'items-start'}`}>
									<PixelFrameChat
										className={`px-5 py-3 text-sm max-w-[70%] break-words whitespace-normal
										${
											run.isMine
												? 'bg-[color:var(--color-chat-right)] text-[color:var(--color-text)] '
												: 'bg-[color:var(--color-chat-left)] text-[color:var(--color-text)] '
										}
									`}
										side={run.isMine ? 'right' : 'left'}
									>
										{#if m.mediaType === 'Image' && m.mediaUrl}
											<img
												src={m.mediaUrl}
												alt=""
												style="display:block;max-width:100%;height:auto;margin:0 auto;"
												class="h-auto max-h-[14rem] w-auto max-w-[14rem] rounded object-contain"
											/>
										{:else}
											{#await renderMessage(m.content ?? '') then html}{@html html}{/await}
										{/if}
									</PixelFrameChat>

									{#if run.isMine}
										{@const s = statusForMessage(m)}
										{#if s?.kind === 'sending'}
											<div class="mt-1 text-xs text-[color:var(--color-landingpage-subtitle)]">
												<LoadingDots label="Sending" ariaLabel="Sending" />
											</div>
										{:else if s?.kind === 'delivered'}
											<div class="mt-1 text-xs text-[color:var(--color-landingpage-subtitle)]">
												Delivered
											</div>
										{:else if s?.kind === 'read'}
											<div class="mt-1 text-xs text-[color:var(--color-landingpage-subtitle)]">
												Read by {s.count}
											</div>
										{/if}
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div
				class="relative flex h-auto w-full items-end gap-4 border-[color:var(--color-accent-1)] px-6 pt-2 pb-3"
			>
				{#if pendingImages.length > 0}
					<div class="absolute right-6 bottom-full left-6 z-50 mb-2 flex flex-wrap gap-2">
						{#each pendingImages as p (p.id)}
							<div class="relative h-[3.5rem] w-[3.5rem]">
								<div
									class="h-full w-full overflow-hidden rounded border border-[color:var(--color-accent-1)] bg-white"
								>
									<img src={p.previewUrl} alt="" class="h-full w-full object-cover" />
								</div>
								<button
									type="button"
									class="absolute -top-2 -right-2 z-50 flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--color-accent-1)] bg-white text-xs text-black"
									aria-label="Remove image"
									onclick={() => removePending(p.id)}
								>
									x
								</button>
							</div>
						{/each}
					</div>
				{/if}

				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					multiple
					class="hidden"
					onchange={onPickImage}
				/>

				<button
					type="button"
					class="order-first h-[2.5rem] w-[2.5rem] self-center rounded-xl border border-[color:var(--color-accent-1)] bg-[color:var(--color-landingpage-subtitle)] text-lg text-[color:var(--color-shadow-black)]"
					onclick={openPicker}
				>
					+
				</button>

				<div class="relative flex-1">
					<textarea
						bind:this={textareaRef}
						placeholder="Type a message… (use ` for inline code or ``` for simple code block and ```java for Java code block)"
						class="max-h-[8.5rem] min-h-[2.5rem] w-full resize-none overflow-y-auto rounded-xl border border-[color:var(--color-accent-1)] bg-[color:var(--color-landingpage-subtitle)] px-4 py-2 font-sans text-sm text-[color:var(--color-shadow-black)]"
						bind:value={message}
						oninput={resizeTextarea}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								sendAll();
							}
						}}
					></textarea>
				</div>

				<div class="translate-y-[-2px]">
					<Button
						size="small"
						label="→"
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="2rem"
						labelFontWeight="normal"
						labelTracking="extra"
						labelClass=""
						onclick={sendAll}
					/>
				</div>
			</div>
		</div>
	</PixelFrameSimple>
</div>

<style>
	:global(#chat-scroll) {
		scroll-behavior: smooth;
	}
</style>
