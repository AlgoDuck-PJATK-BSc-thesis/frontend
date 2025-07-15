import type { PageLoad } from "./$types";

// don't change this or monaco will have a stroke and crash the entire app
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
    let exerciseId : string = params.Problem_id;
    //TODO fetch actual exercise contents
    return {
        template: 
`public class Main {
    public static int[] sortIntArr(int[] toBeSorted){
        return null;
    }
    public static void main(String[] args) {
    }
}`,
        description: "sort these ints",
        name: "int array sort",
        testCases: [{testData: "[1,2,3]", expectedOutput: "[1,2,3]"}, {testData: "[4,5,6]", expectedOutput: "[4,5,6]"}, {testData: "[7,8,9]", expectedOutput: "[7,8,9]"}],
        tags: ["tag1", "tag2", "tag3"]
    }
}
