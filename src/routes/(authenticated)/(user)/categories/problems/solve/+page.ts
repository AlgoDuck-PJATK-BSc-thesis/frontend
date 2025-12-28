import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
import type { AutoSaveDto, ProblemDetailsDto } from "$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs";
import type { ChatList } from "$lib/types/domain/modules/problem/assistant";
import type { SolvePageLoadArgs } from "$lib/types/ui/modules/problem/solvePageLoadArgs";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ params, fetch, url }) : Promise<SolvePageLoadArgs> => {
  const problemId = url.searchParams.get('problem');
  
  return {
    hideHeader: true,
    problemLoadResponse: FetchFromApi<ProblemDetailsDto>("Problem", {
      method: "GET"
    }, fetch, new URLSearchParams({problemId: problemId ?? ""})),
    chatList: FetchFromApi<ChatList>("Chat", {
      method: "GET"
    }, fetch, new URLSearchParams({problemId: problemId ?? ""})),
    autoSave: FetchFromApi<AutoSaveDto>("LoadAutoSave", {
      method: "GET"
    }, fetch, new URLSearchParams({problemId: problemId ?? ""}))
  };
}

