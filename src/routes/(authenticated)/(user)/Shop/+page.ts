import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
import type { PageLoad } from "./$types";
import type { Duck, DuckShopPage } from "./Dtos";
import { simulateFetchAsync } from "./loadDucks";

export const load: PageLoad = async ({ params, fetch, url }) : Promise<StandardResponseDto<CustomPageData<Duck>>> => {

    const currentPage: string = url.searchParams.get('currentPage') ?? "1";
    const pageSize: string = url.searchParams.get('pageSize') ?? "12";

    return await FetchFromApi<CustomPageData<Duck>>("Item", {
        method: "GET"
    }, fetch, new URLSearchParams({ currentPage: currentPage, pageSize: pageSize}))

}
