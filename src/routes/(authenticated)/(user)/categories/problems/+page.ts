import { FetchFromApi } from "$lib/api/apiCall";
import type { Category } from "$lib/types/Category";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ params, fetch, url }) => {

    let res = await FetchFromApi("User/me", {
        method: "GET"
    }, fetch);

    console.log(url.searchParams.get("category"));
    const serverResponse: Category = {
        name: "test-1",
        problems: [{
            id: "3152daea-43cd-426b-be3b-a7e6d0e376e1",
            name: "turtle & hare",
            synopsis: "some short synopsis..."
        }]
    }

    return serverResponse;
}
