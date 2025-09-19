import type { Problem } from "$lib/types/Problem";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
    return {
        problem: fallback,
        hideHeader: true
    };
}

const fallback: Problem = {
  "problemId": "3152daea-43cd-426b-be3b-a7e6d0e376e1",
  "title": "Linked List Cycle Detection",
  "description": "In many applications, linked lists are used to represent dynamic data structures.  \nHowever, faulty logic or unintended pointer manipulations can sometimes cause a **cycle** to appear in the list, meaning that traversal never reaches a `null` terminator.  \n\nYour task is to implement a cycle detection algorithm for a **doubly linked list**. Specifically, you should: \n1. **Define a `Node` class**  \n- Contains an integer value  \n- Has both `next` and `prev` references  \n\n2. **Implement a method `hasCycle(Node start)`**  \n- Determines whether a cycle exists starting from the provided node  \n3. **Use Floyd’s Tortoise and Hare algorithm**  \n- A classic two-pointer technique  \n- Detects the cycle efficiently in **O(n) time** and **O(1) space**  \nA correct solution should be able to identify both the **presence and absence of cycles** for lists of varying sizes.  \n### Edge Cases to Consider\n- Empty list (`null` start node)  \n- Single-node list without a cycle  \n- Single-node list that links to itself",
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
  ],
  "tags": [
    "cycle-detection",
    "linked-list",
    "pointer-manipulation",
    "two-pointers",
    "graph-theory-in-disguise",
  ],
};
