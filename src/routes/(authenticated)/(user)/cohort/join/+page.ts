import type { PageLoad } from './$types';
import type { DuckDto } from '../../Shop/Dtos';
import { loadDucks } from '../../Shop/loadDucks';

export const load: PageLoad = async () => {
	const ducks: DuckDto[] = await loadDucks();
	return { ducks };
};
