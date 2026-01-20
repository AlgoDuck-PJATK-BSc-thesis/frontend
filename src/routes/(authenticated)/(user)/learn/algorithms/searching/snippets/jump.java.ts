export const meta = {
	title: 'Jump Search',
	what: 'Jumps ahead by √n steps to find a block, then linearly searches inside that block.',
	when: ['Sorted arrays', 'When random access is cheap'],
	avoid: ['Unsorted arrays'],
	time: { best: 'O(1)', avg: 'O(√n)', worst: 'O(√n)' },
	space: 'O(1)',
	flags: { sortedRequired: true }
};

export const java = `public class JumpSearch {
    public static int search(int[] arr, int target) {
        if (arr == null || arr.length == 0) return -1;

        int n = arr.length;
        int step = (int)Math.floor(Math.sqrt(n));
        if (step < 1) step = 1;

        int prev = 0;
        int next = step;

        while (prev < n && arr[Math.min(next, n) - 1] < target) {
            prev = next;
            next += step;
            if (prev >= n) return -1;
        }

        int end = Math.min(next, n);
        while (prev < end && arr[prev] < target) {
            prev++;
        }

        if (prev < n && arr[prev] == target) return prev;
        return -1;
    }
}`;
