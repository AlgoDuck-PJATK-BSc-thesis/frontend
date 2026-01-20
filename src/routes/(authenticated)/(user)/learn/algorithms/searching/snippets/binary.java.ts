export const meta = {
	title: 'Binary Search',
	what: 'Halves the search range by comparing the target to the midpoint (sorted arrays).',
	when: ['Sorted arrays', 'Repeated lookups', 'Large datasets'],
	avoid: ['Unsorted arrays'],
	time: { best: 'O(1) if middle immediately hits target', avg: 'O(log n)', worst: 'O(log n)' },
	space: 'O(1)',
	flags: { sortedRequired: true }
};

export const java = `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`;
