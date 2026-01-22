export const isBrowser = typeof window !== 'undefined';

export const rafTick = () =>
	new Promise<void>((resolve) => {
		if (!isBrowser) return resolve();
		requestAnimationFrame(() => resolve());
	});

export const normalizeMediaType = (mt: unknown): 'Text' | 'Image' => {
	if (mt === 1) return 'Image';
	if (typeof mt === 'string') {
		const v = mt.toLowerCase();
		if (v === 'image') return 'Image';
	}
	return 'Text';
};

export const extractSignalRError = (e: unknown): string => {
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

export const newClientMessageId = () => {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return `${Date.now()}-${Math.random()}`;
};

export const formatTime = (iso: string) =>
	new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
