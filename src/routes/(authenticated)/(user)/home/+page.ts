import { FetchFromApi } from "$lib/api/apiCall";
import type { UsedDuckDto, UsedPlantDto } from "$lib/Components/Misc/Pond/duckTypes";
import type { PageLoad } from "../delete-account/$types";

export const load: PageLoad = async ({ fetch, params }) => {
    let res = await FetchFromApi<OwnedUsedItems>("OwnedUsedItems", {
        method: "GET"
    }, fetch)
    console.log(res.body);
    return res;
}

export type OwnedUsedItems = {
    ducks: UsedDuckDto[],
    plants: UsedPlantDto[],
}