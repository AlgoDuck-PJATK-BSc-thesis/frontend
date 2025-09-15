import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
    let categoryId: string = params.Category_id;

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

export interface Category{
    name: string,
    problems: ProblemShowcase[],
}

export interface ProblemShowcase{
    id: string,
    name: string,
    synopsis: string,
}