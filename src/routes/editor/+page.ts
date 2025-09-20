import type { PageLoad } from "./$types";
import { InitializeRegistryPlaceholder } from "./ComponentRegistry";

export const load: PageLoad = async ({ params, fetch }) => {
  InitializeRegistryPlaceholder();
    return {
        hideHeader: true,
        data: {
            "problemId": "",
            "title": "",
            "description": "",
            "category": {
                "name": ""
            },
            "difficulty": {
                "name": ""
            },
            "type": {
                "name": ""
            },
            "templateContents": "",
            "testCases": [],
            "tags": [],
        }
    }
}