import { get, type Readable } from 'svelte/store';
import type { LocalMessage } from '../types';

export type MessageStatus =
	| { kind: 'sending' }
	| { kind: 'delivered' }
	| { kind: 'read'; count: number };

export const createStatusForMessage = (params: {
	allMessages: Readable<LocalMessage[]>;
	readByCountByMessageId: Readable<Record<string, number>>;
}) => {
	return (m: LocalMessage): MessageStatus | null => {
		if (!m.isMine) return null;

		const msgs = get(params.allMessages);
		const map = get(params.readByCountByMessageId);

		const tail: LocalMessage[] = [];
		for (let i = msgs.length - 1; i >= 0; i--) {
			const x = msgs[i];
			if (!x.isMine) break;
			tail.unshift(x);
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
		if (!statusTarget) return null;
		if (statusTarget.messageId !== m.messageId) return null;

		if (statusTarget.deliveryState === 'sending') return { kind: 'sending' };

		const fromMap = map[m.messageId];
		const fromMsg = statusTarget.readByCount ?? null;
		const c = typeof fromMap === 'number' ? fromMap : (fromMsg ?? null);

		if (c && c > 0) return { kind: 'read', count: c };

		return { kind: 'delivered' };
	};
};
