import type { PageLoad } from './$types';
import type { Problem } from '$lib/types/Problem';

export const load: PageLoad = async ({ params }) => {
	const overrides: Record<string, Partial<Problem>> = {
		p1: {
			title: 'Two pointers',
			description:
				'Given a sorted array of integers and a target value, find the indices of two numbers that sum to the target. Return the indices as a list or [-1, -1] if no pair exists.\n\nUse a two-pointer approach in O(n) time and O(1) space.',
			difficulty: { name: 'EASY' },
			tags: ['two-pointers', 'arrays', 'target-sum', 'optimization']
		},
		p2: {
			title: "Kadane's Algorithm",
			description:
				'Find the maximum sum of a contiguous subarray in a given array of integers. Return the value of this maximum sum.\n\nImplement Kadane\'s algorithm to achieve O(n) time and O(1) space complexity.',
			difficulty: { name: 'MEDIUM' },
			tags: ['kadane', 'max-subarray', 'dynamic-programming', 'arrays']
		},
		p3: {
			title: 'Maximum Product Subarray',
			description:
				'Find the maximum product of a contiguous subarray within a given array of integers. Return the value of this product.\n\nBe mindful of negative numbers; track both the maximum and minimum products at each step.',
			difficulty: { name: 'HARD' },
			tags: ['product-subarray', 'max-product', 'arrays', 'dynamic-programming']
		}
	};

	const { problemId } = params as Record<string, string>;

	const base: Problem = { ...fallbackProblem };
	const override = overrides[problemId];

	const problem: Problem = override ? { ...base, ...override } : base;

	return {
		problem,
		hideHeader: true
	};
};

const fallbackProblem: Problem = {
	problemId: 'example-id',
	title: 'Linked List Cycle Detection',
	description:
		'Implement cycle detection for a doubly linked list using Floyd’s Tortoise and Hare algorithm.',
	category: { name: 'Example Category' },
	difficulty: { name: 'MEDIUM' },
	type: { name: 'Algorithm' },
	templateContents: `public class Main {
    // Przykladowy szablon
  }\n`,
	testCases: [
		{
			testCaseId: '7a2264fa-b7a2-4250-ac4b-a868f746c978',
			display: 'Linear list: 1 → 2 → 3 → 4 → null',
			displayRes: 'false (no cycle)',
			isPublic: true,
			isPassed: null
		},
		{
			testCaseId: '2ed6b7ae-4dd0-4c26-84ee-ce849dd9ce13',
			display: 'Cyclic list: 1 → 2 → 3 → 4 → (back to 2)',
			displayRes: 'true (cycle detected)',
			isPublic: true,
			isPassed: null
		}
	],
	tags: ['linked-list', 'cycle-detection', 'two-pointers']
};
