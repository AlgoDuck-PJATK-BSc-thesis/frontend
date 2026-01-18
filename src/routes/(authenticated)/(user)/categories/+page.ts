import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) : Promise<StandardResponseDto<CategoryDto[]>> => {    
    return await FetchFromApi<CategoryDto[]>("ProblemCategories", {
        method: "GET"
    }, fetch);
}

export type CategoryDto = {
    categoryId: string, /* TODO: I was under the impression that there was an UUID type??? */
    categoryName: string
}
