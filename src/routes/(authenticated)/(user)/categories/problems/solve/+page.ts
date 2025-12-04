import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
import type { ProblemDetailsDto } from "$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ params, fetch, url }) : Promise<{hideHeader: boolean, problemLoadResponse: Promise<StandardResponseDto<ProblemDetailsDto>>}> => {
  const problemId = url.searchParams.get('problem');
  
  return {
    hideHeader: true,
    problemLoadResponse: FetchFromApi<ProblemDetailsDto>("Problem", {
      method: "GET"
    }, fetch, new URLSearchParams({problemId: problemId ?? ""}))
  };
}