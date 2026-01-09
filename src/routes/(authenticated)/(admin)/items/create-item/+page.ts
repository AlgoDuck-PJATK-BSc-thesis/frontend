import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
import type { PageLoad } from "./$types";
import type { RarityDto } from "./ItemCreationTypes";

export const load: PageLoad = async ({ url, fetch }): Promise<StandardResponseDto<RarityDto[]>> => {
    return await FetchFromApi<RarityDto[]>("item/rarity", {
        method: "GET"
    })
}