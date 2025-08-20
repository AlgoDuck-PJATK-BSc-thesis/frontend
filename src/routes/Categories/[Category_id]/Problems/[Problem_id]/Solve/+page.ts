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
    if (!result.ok){
        return fallback;
    }
    const serverResponse: Problem = await result.json();
    console.log(serverResponse)
    serverResponse.testCases.forEach(tc=>tc.isPassed=null); // TODO I don't love this
    return serverResponse
}






const fallback: Problem = {
  "problemId": "3152daea-43cd-426b-be3b-a7e6d0e376e1",
  "title": "Linked List Cycle Detection",
  "description": "Implement a method to detect cycles in a linked list using the tortoise and hare algorithm. The solution should include a Node class with next and previous references, and a method that checks for cycles starting from a given node.",
  "category": {
    "name": "test category 4"
  },
  "difficulty": {
    "name": "MEDIUM"
  },
  "type": {
    "name": "test2"
  },
  "templateContents": "public class Main {\n    private static class Node {\n        int data;\n        Node next;\n        Node prev;\n\n        public Node(int data) {\n            this.data = data;\n            this.next = null;\n            this.prev = null;\n        }\n    }\n\n    public static boolean hasCycle(Node start) {\n        // Implement the tortoise and hare algorithm here\n        return false;\n    }\n}\n",
  "testCases": [
    {
      "testCaseId": "7a2264fa-b7a2-4250-ac4b-a868f746c978",
      "display": "Linear list: 1 → 2 → 3 → 4 → null",
      "displayRes": "false (no cycle)",
      "isPublic": true,
      "isPassed": null
    },
    {
      "testCaseId": "2ed6b7ae-4dd0-4c26-84ee-ce849dd9ce13",
      "display": "Cyclic list: 1 → 2 → 3 → 4 → (back to 2)",
      "displayRes": "true (cycle detected)",
      "isPublic": true,
      "isPassed": null
    },
    {
      "testCaseId": "c2031e76-abf0-4840-8f12-f404df11bb32",
      "display": "",
      "displayRes": "",
      "isPublic": false,
      "isPassed": null
    },
    {
      "testCaseId": "acb062e7-922f-4ed0-b86c-ac2562a4b959",
      "display": "",
      "displayRes": "",
      "isPublic": false,
      "isPassed": null
    }
  ]
};