export const meta = {
	title: 'Linear Search',
	what: 'Checks each element sequentially until the target is found or the list ends.',
	when: ['Unsorted arrays', 'Very small arrays', 'One-off lookups'],
	avoid: ['Large arrays with repeated queries'],
	time: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
	space: 'O(1)',
	flags: { sortedRequired: false }
};

export const java = `public class LinearSearch {
    public static int search(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }
}`;
