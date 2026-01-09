import { FetchFromApi } from "$lib/api/apiCall";
import type { PageLoad } from "../../../../$types";

export const load: PageLoad = async ({ url, fetch }) => {
    console.log('huh');
    const problemId: string | null = url.searchParams.get('problemId');
    if (problemId){
        console.log("huh");
        let res = await FetchFromApi("ProblemStatsAdmin", {
            method: "GET"
        }, fetch, new URLSearchParams({ problemId: problemId, runtimebucketSize: "1000000", memBucketSize: "50", recentSubmissionCount: "10"}))
        console.log(res.body);
        return res.body
    }
}