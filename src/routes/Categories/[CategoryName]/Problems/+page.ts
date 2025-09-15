import type { PageLoad } from "../../$types";
import type { Category } from "./Types/Category";

export const load: PageLoad = async ({ params, fetch }) => {

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
