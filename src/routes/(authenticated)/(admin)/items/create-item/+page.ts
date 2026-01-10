import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
import type { PageLoad } from "./$types";
import type { ItemCreateDto, ItemCreationPageArgs, RarityDto } from "./ItemCreationTypes";

export const load: PageLoad = async ({ url, fetch }): Promise<ItemCreationPageArgs> => {

    const itemId: string | undefined = url.searchParams.get("itemId") ?? undefined;
    let rarities: StandardResponseDto<RarityDto[]> = await FetchFromApi<RarityDto[]>("item/rarity", {
        method: "GET"
    });

    let itemData: StandardResponseDto<ItemCreateDto> | undefined;

    if (itemId){
        itemData = await FetchFromApi<ItemCreateDto>("item/admin/form", {
            method: "GET"
        }, fetch, new URLSearchParams({ itemId: itemId }));
        console.log(itemData);
    }

    return {
        rarities: rarities.body,
        itemData: itemData?.body,
        isEditMode: url.searchParams.get("edit") === "true",
        itemId: itemId
    }
}