import type { PageLoad } from './$types';
import type { DuckDto } from '../../Shop/Dtos';
import { getDucksPaged } from '$lib/api/ducks';

export const load: PageLoad = async ({ fetch }) => {
	const { ducks } = await getDucksPaged(fetch, 0, 50);
	const duckIds: DuckDto[] = ducks.map((d) => ({ id: d.id }));
	return { ducks: duckIds };
};
