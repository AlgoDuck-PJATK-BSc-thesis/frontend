import type { Problem } from "../../../../../../Types/Categories/Problem";
import type { PageLoad } from "./$types";

// don't change this or monaco will have a stroke and crash the entire app
export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
    let exerciseId: string = params.Problem_id;
    let exId="3152daea-43cd-426b-be3b-a7e6d0e376e1";
    
    console.log(exerciseId);
    const result = await fetch(`http://localhost:8080/api/Problem?id=${exerciseId}`, {
        method: 'GET',
    });
    
    const serverResponse: Problem = await result.json();
    
    return serverResponse
}