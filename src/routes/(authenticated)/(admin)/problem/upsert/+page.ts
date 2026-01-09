import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
import type { PageLoad } from "../problem-details/$types";
import type { CategoryDto, DifficultyDto, ProblemCreatePageArgs } from "./problemAddTypes";
import type { problemCreationDto, TestCaseCreateDto } from "./TestCase";

export const load: PageLoad = async ({ fetch, url }) => {
    let categoryPromise = FetchFromApi<CategoryDto[]>("ProblemCategories", {
        method: "GET"
    }, fetch);
    let diffPromise = FetchFromApi<DifficultyDto[]>("AllDifficulties", {
        method: "GET"
    }, fetch);

    const problemId: string | null = url.searchParams.get("problemId");
    const isEditMode: boolean = url.searchParams.get("edit") === "true"

    let promises : Promise<any>[] = [categoryPromise, diffPromise];
    let loadedDto : Promise<StandardResponseDto<problemCreationDto>> | undefined = problemId ? FetchFromApi<problemCreationDto>("FormStateLoad", {
            method: "GET"
        }, fetch, new URLSearchParams({ problemId: problemId})) : undefined
    

    Promise.all(promises)

    let problemLoadBody: problemCreationDto | undefined;
    if (loadedDto !== undefined){
        let problemCreateLoaded: StandardResponseDto<problemCreationDto> = await loadedDto;
        problemCreateLoaded.body.templateB64 = atob(problemCreateLoaded.body.templateB64)

        problemCreateLoaded.body.testCases = problemCreateLoaded.body.testCases.map(t => ({ ...t, arrangeB64: atob(t.arrangeB64)})) 
        problemLoadBody = problemCreateLoaded.body;
    }
    return {
        difficulties: (await diffPromise).body,
        categories: (await categoryPromise).body,
        loadedCreateDto: problemLoadBody,
        isEditMode: isEditMode,
        problemId: problemId
    } as ProblemCreatePageArgs
}

