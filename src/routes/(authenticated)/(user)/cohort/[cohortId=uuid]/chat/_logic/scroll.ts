import { get, type Readable } from 'svelte/store';
import { HubConnectionState, type HubConnection } from '@microsoft/signalr';
import type { LocalMessage } from '../types';
import { isBrowser } from '../util';

export const createChatScroll = (params: {
	cohortId: Readable<string>;
	allMessages: Readable<LocalMessage[]>;
	conn: Readable<HubConnection | null>;
	query: Readable<any>;
	rafTick: () => Promise<void>;
	tick: () => Promise<void>;
	onFetchOlder: () => Promise<void>;
}) => {
	let detach: null | (() => void) = null;

	let lastMarkedReadMessageId: string | null = null;
	let lastMarkedReadAtMs = 0;

	const scrollStorageKey = () => {
		const id = get(params.cohortId);
		return id ? `cohort-chat-scroll:${id}` : '';
	};

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
		const key = scrollStorageKey();
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
		await params.tick();
		await params.rafTick();
		const el = getScrollEl();
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior });
		await params.rafTick();
		const el2 = getScrollEl();
		if (!el2) return;
		el2.scrollTo({ top: el2.scrollHeight, behavior: 'auto' });
		persistScroll();
	};

	const restoreScroll = async (): Promise<{ hadPayload: boolean; wantsBottom: boolean }> => {
		if (!isBrowser) return { hadPayload: false, wantsBottom: true };
		const key = scrollStorageKey();
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

		await params.tick();
		await params.rafTick();
		const el = getScrollEl();
		if (el) el.scrollTop = payload.top;
		return { hadPayload: true, wantsBottom: false };
	};

	const getLastNonLocalMessageId = () => {
		const msgs = get(params.allMessages);
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
		const cohortId = get(params.cohortId);
		if (!cohortId) return;
		if (document.visibilityState !== 'visible') return;
		if (!computeNearBottom()) return;

		const c = get(params.conn);
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

	const attach = () => {
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

			const q = get(params.query);
			if (!q?.hasNextPage) return;
			if (q?.isFetchingNextPage) return;

			const prevHeight = el.scrollHeight;
			await params.onFetchOlder();
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

	const mount = async () => {
		if (detach) detach();
		detach = attach();
		await restoreScroll();
		await markReadIfAppropriate();
	};

	const destroy = () => {
		if (detach) detach();
		detach = null;
	};

	const resetReadMarkers = () => {
		lastMarkedReadMessageId = null;
		lastMarkedReadAtMs = 0;
	};

	return {
		mount,
		destroy,
		scrollToBottom,
		restoreScroll,
		markReadIfAppropriate,
		resetReadMarkers,
		computeNearBottom,
		persistScroll
	};
};
