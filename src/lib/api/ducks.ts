import { FetchFromApi } from '$lib/api/apiCall';
import { DuckRarity, type DuckDto } from '$lib/types/DuckDto';

type ItemRarityDto = { rarityName: string };

type DuckItemDto = {
	itemId: string;
	name: string;
	price: number;
	isOwned: boolean;
	itemRarity: ItemRarityDto;
};

type PageData<T> = {
	currPage: number;
	pageSize: number;
	totalItems: number;
	nextCursor: number | null;
	prevCursor: number | null;
	items: T[];
};

const rarityFromName = (name: string): DuckRarity => {
	const v = (DuckRarity as any)[name];
	return typeof v === 'number' ? (v as DuckRarity) : DuckRarity.Common;
};

export const getDucksPaged = async (fetchFn: typeof fetch, page: number, pageSize: number) => {
	const sp = new URLSearchParams();
	sp.set('currentPage', String(page + 1));
	sp.set('pageSize', String(pageSize));

	const res = await FetchFromApi<PageData<DuckItemDto>>('AllDucks', { method: 'GET' }, fetchFn, sp);
	const data = res.body;

	const ducks: DuckDto[] = data.items.map((i) => ({
		id: i.itemId,
		name: i.name,
		description: '',
		isPurchased: i.isOwned,
		price: i.price,
		rarity: rarityFromName(i.itemRarity.rarityName)
	}));

	return { ducks, data };
};
