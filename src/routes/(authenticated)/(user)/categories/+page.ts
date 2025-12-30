import { FetchFromApi } from '$lib/api/apiCall';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) : Promise<{categories: CategoryDto[]}> => {    
    let resp = await FetchFromApi<CategoryDto[]>("ProblemCategories", {
        method: "GET"
    }, fetch);

    return {
        categories: [
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
            { id: '', categoryName: 'test category 4'},
        ]
    };
}

export type CategoryDto = {
    id: string, /* TODO: I was under the impression that there was an UUID type??? */
    categoryName: string
}
