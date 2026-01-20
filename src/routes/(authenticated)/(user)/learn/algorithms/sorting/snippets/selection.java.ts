export const meta = {
	title: 'Selection Sort',
	what: 'Selects the smallest remaining element and swaps it into the next position. It always does O(n^2) comparisons, but makes only O(n) swaps.',
	when: ['Small arrays', 'When swaps are expensive and comparisons are cheap'],
	avoid: ['Large datasets'],
	time: { best: 'O(n^2)', avg: 'O(n^2)', worst: 'O(n^2)' },
	space: 'O(1)',
	flags: { stable: false, inPlace: true }
};

export const java = `public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }
}`;
