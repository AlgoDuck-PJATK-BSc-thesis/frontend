export const meta = {
	title: 'Interpolation Search',
	what: 'Estimates the likely position based on value distribution (uniform distributions shine).',
	when: ['Uniformly distributed sorted arrays'],
	avoid: ['Highly skewed distributions', 'Unsorted arrays'],
	time: { best: 'O(1)', avg: 'O(log log n)', worst: 'O(n)' },
	space: 'O(1)',
	flags: { sortedRequired: true, uniformHelpful: true }
};

export const java = `public class InterpolationSearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;

        while (left <= right && target >= arr[left] && target <= arr[right]) {
            if (arr[left] == arr[right]) {
                return arr[left] == target ? left : -1;
            }

            int pos = left + ((target - arr[left]) * (right - left))
                    / (arr[right] - arr[left]);

            if (arr[pos] == target) return pos;
            if (arr[pos] < target) left = pos + 1;
            else right = pos - 1;
        }

        return -1;
    }
}`;
