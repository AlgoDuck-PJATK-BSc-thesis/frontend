import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
import type { PageLoad } from "../$types";
import type { ProblemDisplayDto } from "./solve/types";

export const load: PageLoad = ({ params, url, fetch }) : Promise<StandardResponseDto<ProblemDisplayDto[]>> => {
    return FetchFromApi<ProblemDisplayDto[]>("CategoryProblems", {
        method: "GET"
    }, fetch, new URLSearchParams({ categoryName: url.searchParams.get("category") ?? "huh" }));;
}
