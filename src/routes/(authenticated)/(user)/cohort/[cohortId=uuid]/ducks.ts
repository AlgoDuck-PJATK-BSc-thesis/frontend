import type { DuckDto } from '../../Shop/Dtos';

export const normalizeToCloudfrontKey = (value: string): string => {
	const v = (value ?? '').toString().trim();
	if (!v) return '';
	if (v.startsWith('http://') || v.startsWith('https://')) {
		try {
			const u = new URL(v);
			const p = (u.pathname ?? '').replace(/^\/+/, '').trim();
			return p || '';
		} catch {
			return '';
		}
	}
	return v;
};

export const pickOneRandomDuck = (list: DuckDto[]): DuckDto | null => {
	const copy = [...(list ?? [])];
	if (copy.length === 0) return null;
	copy.sort(() => Math.random() - 0.5);
	return copy[0] ?? null;
};

export const duckIdFromDto = (d: DuckDto | null): string => {
	const anyD = d as any;
	return (anyD?.id ?? anyD?.duckId ?? anyD?.itemId ?? anyD?.duckItemId ?? '').toString().trim();
};

export const duckImageFromDto = (d: DuckDto | null): string => {
	if (!d) return '';
	const anyD = d as any;
	const candidates = [
		anyD?.imageUrl,
		anyD?.s3ImageUrl,
		anyD?.previewUrl,
		anyD?.thumbnailUrl,
		anyD?.iconUrl,
		anyD?.spriteUrl,
		anyD?.url,
		anyD?.path,
		anyD?.key
	]
		.map((x: unknown) => (typeof x === 'string' ? x : '').trim())
		.filter((x: string) => x.length > 0);

	if (candidates.length) return candidates[0];

	const id = duckIdFromDto(d);
	if (id) return `Ducks/Outfits/duck-${id}.png`;
	return '';
};

export const pickWelcomeDuckPath = (ducks: DuckDto[], fallbackKey: string) => {
	const picked = pickOneRandomDuck(ducks ?? []);
	const raw = duckImageFromDto(picked);
	const key = normalizeToCloudfrontKey(raw);
	return key || fallbackKey;
};
