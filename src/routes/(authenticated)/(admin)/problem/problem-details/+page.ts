import { FetchFromApi } from "$lib/api/apiCall";
import type { PageLoad } from "../../../../$types";

export const load: PageLoad = async ({ url, fetch }) => {
    const problemId: string | null = url.searchParams.get('problemId');
    if (problemId){
        let res = await FetchFromApi("admin/problem/stats", {
            method: "GET"
        }, fetch, new URLSearchParams({ problemId: problemId, runtimebucketSize: "1000000", memBucketSize: "50", recentSubmissionCount: "10"}))
        return res.body
    }
}