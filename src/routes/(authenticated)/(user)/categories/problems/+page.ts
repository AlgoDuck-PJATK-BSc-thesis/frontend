import { FetchFromApi } from "$lib/api/apiCall";
import type { Category } from "$lib/types/Category";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ params, url, fetch }) : Promise<ProblemListPageLoadArg> => {

    let response = await FetchFromApi<ProblemDisplayDto[]>("CategoryProblems", {
        method: "GET"
    }, fetch, new URLSearchParams({categoryName: "test category 4"}));

    return {
        problems: response.body 
    };
}

export type ProblemListPageLoadArg = {
    problems: ProblemDisplayDto[]
}

type ProblemDisplayDto = {
    problemId: string, 
    title: string,
    difficulty: DifficultyDto,
    tags: TagDto[]
}

type TagDto = {
    name: string
}

type DifficultyDto = {
    name: string
}
