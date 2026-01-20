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
        if (arr == null || arr.length == 0) return -1;

        int left = 0;
        int right = arr.length - 1;

        while (left <= right && target >= arr[left] && target <= arr[right]) {
            if (arr[left] == arr[right]) {
                return arr[left] == target ? left : -1;
            }

            long num = (long)(target - arr[left]) * (right - left);
            long den = (long)(arr[right] - arr[left]);
            int pos = left + (int)(num / den);

            if (pos < left || pos > right) return -1;

            if (arr[pos] == target) return pos;
            if (arr[pos] < target) left = pos + 1;
            else right = pos - 1;
        }

        return -1;
    }
}`;
