export const meta = {
	title: 'Bubble Sort',
	what: 'Repeatedly compares adjacent elements and swaps when out of order.',
	when: ['Tiny arrays', 'Teaching/visualization', 'Nearly sorted data (early exit)'],
	avoid: ['Large datasets'],
	time: { best: 'O(n)', avg: 'O(n^2)', worst: 'O(n^2)' },
	space: 'O(1)',
	flags: { stable: true, inPlace: true }
};

export const java = `public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}`;
