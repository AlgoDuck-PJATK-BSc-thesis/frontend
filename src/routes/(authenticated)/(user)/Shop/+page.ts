import type { PageLoad } from "./$types";
import type { DuckShopPage } from "./Dtos";
import { simulateFetchAsync } from "./loadDucks";

export const load: PageLoad = async ({ params }) : Promise<DuckShopPage> => {
    return simulateFetchAsync(1);
}
