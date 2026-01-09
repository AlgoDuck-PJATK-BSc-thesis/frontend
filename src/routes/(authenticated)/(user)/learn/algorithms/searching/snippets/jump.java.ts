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
        int n = arr.length;
        int step = (int) Math.floor(Math.sqrt(n));
        int prev = 0;

        while (arr[Math.min(step, n) - 1] < target) {
            prev = step;
            step += (int) Math.floor(Math.sqrt(n));
            if (prev >= n) return -1;
        }

        while (arr[prev] < target) {
            prev++;
            if (prev == Math.min(step, n)) return -1;
        }

        if (arr[prev] == target) return prev;
        return -1;
    }
}`;
