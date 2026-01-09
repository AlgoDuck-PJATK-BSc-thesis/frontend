import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
import type { PageLoad } from "./$types";
import type { FullItemDetailsDto } from "./ItemDetailsTypes";

export const load: PageLoad = async ({ url, fetch }): Promise<StandardResponseDto<FullItemDetailsDto>> => {
    const itemId: string = url.searchParams.get('itemId') ?? "";
    return await FetchFromApi<FullItemDetailsDto>("admin/item/detail", {
        method: "GET"
    }, fetch, new URLSearchParams({ itemId: itemId }));
};