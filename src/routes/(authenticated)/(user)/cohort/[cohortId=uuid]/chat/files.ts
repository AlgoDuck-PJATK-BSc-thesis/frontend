import type { PendingImage } from './types';

const inferContentType = (name: string): string | null => {
	const lower = (name ?? '').toLowerCase();
	if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
	if (lower.endsWith('.png')) return 'image/png';
	if (lower.endsWith('.webp')) return 'image/webp';
	if (lower.endsWith('.gif')) return 'image/gif';
	return null;
};

const newId = () => {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return `${Date.now()}-${Math.random()}`;
};

export const addFiles = (
	files: File[],
	existing: PendingImage[],
	notify: (msg: string) => void
): PendingImage[] => {
	const next: PendingImage[] = [];

	for (const file of files) {
		let f = file;

		if (!f.type) {
			const lower = (f.name ?? '').toLowerCase();
			if (lower.endsWith('.heic') || lower.endsWith('.heif')) {
				notify('HEIC/HEIF images are not supported. Please convert to JPG/PNG/WebP.');
				continue;
			}

			const inferred = inferContentType(f.name);
			if (!inferred) continue;
			f = new File([f], f.name, { type: inferred });
		}

		if (!f.type.startsWith('image/')) continue;

		const id = newId();
		const previewUrl = URL.createObjectURL(f);
		next.push({ id, file: f, previewUrl });
	}

	if (next.length === 0) return existing;
	return [...existing, ...next];
};

export const removeFile = (existing: PendingImage[], id: string): PendingImage[] => {
	const found = existing.find((p) => p.id === id);
	if (found) {
		try {
			URL.revokeObjectURL(found.previewUrl);
		} catch {}
	}
	return existing.filter((p) => p.id !== id);
};

export const clearFiles = (existing: PendingImage[]) => {
	for (const p of existing) {
		try {
			URL.revokeObjectURL(p.previewUrl);
		} catch {}
	}
};
