import { FetchFromApi } from "$lib/api/apiCall";
import type { PageLoad } from "./$types";
import type { CategoryDto, DifficultyDto, ProblemCreatePageArgs } from "./problemAddTypes";

export const load: PageLoad = async ({ fetch }) => {
    let categoryPromise = FetchFromApi<CategoryDto[]>("ProblemCategories", {
        method: "GET"
    }, fetch);
    let diffPromise = FetchFromApi<DifficultyDto[]>("AllDifficulties", {
        method: "GET"
    }, fetch);

    Promise.all([categoryPromise, diffPromise])

    return {
        difficulties: (await diffPromise).body,
        categories: (await categoryPromise).body
    } as ProblemCreatePageArgs

}