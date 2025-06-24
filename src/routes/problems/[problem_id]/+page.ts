import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
    let exerciseId : string = params.problem_id;
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
    }
}

export interface ExerciseData{
    template: string,
    description: string,
    name: string,
}
