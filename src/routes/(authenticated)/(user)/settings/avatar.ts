import { coerceString, normalizeToCloudfrontKey } from './utils';

export type AvatarOption = {
	id: string;
	name: string;
	imageUrl: string;
};

export type DuckItemDto = {
	itemId: string;
	name: string;
	isOwned: boolean;
} & Record<string, unknown>;

export type PageDataList<T> = {
	currPage: number;
	pageSize: number;
	totalItems: number;
	nextCursor: number | null;
	prevCursor: number | null;
	items: T[];
};

const isUuid = (s: string) =>
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const idFromDuckKey = (key: string) => {
	const k = normalizeToCloudfrontKey(key);
	const m = k.match(/duck-([0-9a-f-]{36})\.png$/i);
	const id = (m?.[1] ?? '').toString();
	return isUuid(id) ? id : k;
};

const pickImageFromDuckItem = (i: DuckItemDto) => {
	const pick = (v: unknown) => coerceString(v).trim();
	return (
		pick(i.imageUrl) ||
		pick(i.s3ImageUrl) ||
		pick(i.previewUrl) ||
		pick(i.thumbnailUrl) ||
		pick(i.iconUrl) ||
		pick(i.spriteUrl) ||
		pick(i.url) ||
		pick(i.path) ||
		pick(i.key) ||
		''
	);
};

const fallbackDuckKey = (itemId: string) =>
	isUuid(itemId) ? `Ducks/Outfits/duck-${itemId}.png` : '';

const dedupeAvatars = (list: AvatarOption[]) => {
	const seen = new Set<string>();
	const out: AvatarOption[] = [];
	for (const a of list) {
		const key = `${a.id}|${normalizeToCloudfrontKey(a.imageUrl)}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(a);
	}
	return out;
};

export const loadOwnedAvatars = async (
	fetchFn: typeof fetch,
	currentAvatarKey: string,
	defaultAvatar: string
) => {
	const pageSize = 60;
	let page = 0;
	let all: DuckItemDto[] = [];
	let guard = 0;

	while (guard < 80) {
		guard += 1;

		const sp = new URLSearchParams();
		sp.set('currentPage', String(page + 1));
		sp.set('pageSize', String(pageSize));

		const mod = await import('$lib/api/apiCall');
		const res = await mod.FetchFromApi<PageDataList<DuckItemDto>>(
			'item/duck',
			{ method: 'GET' },
			fetchFn,
			sp
		);

		const items = Array.isArray(res.body?.items) ? res.body.items : [];
		all = all.concat(items);

		const total = Number(res.body?.totalItems ?? 0);
		if (!items.length) break;
		if (total > 0 && all.length >= total) break;
		if (items.length < pageSize) break;

		page += 1;
	}

	const owned = all.filter((i) => !!i?.isOwned);

	let ownedAvatars: AvatarOption[] = owned
		.map((i) => {
			const id = coerceString(i.itemId).trim();
			const name = coerceString(i.name).trim() || 'Duck';
			const img = normalizeToCloudfrontKey(pickImageFromDuckItem(i));
			const imageUrl = img || fallbackDuckKey(id);
			return { id, name, imageUrl };
		})
		.filter((a) => !!a.id);

	const currentNorm = normalizeToCloudfrontKey(currentAvatarKey);
	const defaultNorm = normalizeToCloudfrontKey(defaultAvatar);

	if (!ownedAvatars.some((a) => normalizeToCloudfrontKey(a.imageUrl) === defaultNorm)) {
		ownedAvatars = [
			{ id: idFromDuckKey(defaultAvatar), name: 'AlgoDuck', imageUrl: defaultAvatar },
			...ownedAvatars
		];
	}

	if (
		currentNorm &&
		currentNorm !== defaultNorm &&
		!ownedAvatars.some((a) => normalizeToCloudfrontKey(a.imageUrl) === currentNorm)
	) {
		ownedAvatars = [
			{ id: idFromDuckKey(currentNorm), name: 'Current avatar', imageUrl: currentNorm },
			...ownedAvatars
		];
	}

	ownedAvatars = dedupeAvatars(ownedAvatars);

	const hit = currentNorm
		? (ownedAvatars.find((a) => normalizeToCloudfrontKey(a.imageUrl) === currentNorm) ?? null)
		: null;

	const selectedAvatarId =
		hit?.id ?? (currentNorm ? idFromDuckKey(currentNorm) : (ownedAvatars[0]?.id ?? null));

	return { ownedAvatars, selectedAvatarId };
};
