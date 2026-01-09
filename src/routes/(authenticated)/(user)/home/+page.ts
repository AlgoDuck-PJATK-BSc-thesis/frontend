import { FetchFromApi } from "$lib/api/apiCall";
import type { UsedDuckDto, UsedPlantDto } from "$lib/Components/Misc/Pond/duckTypes";
import type { PageLoad } from "../delete-account/$types";

export const load: PageLoad = async ({ fetch, params }) => {
    return await FetchFromApi<OwnedUsedItems>("user/item/pond", {
        method: "GET"
    }, fetch);
}

export type OwnedUsedItems = {
    ducks: UsedDuckDto[],
    plants: UsedPlantDto[],
}