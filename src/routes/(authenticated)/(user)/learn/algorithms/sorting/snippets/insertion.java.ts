export const meta = {
	title: 'Insertion Sort',
	what: 'Builds a sorted prefix, inserting each new element into its correct place by shifting larger elements right. It is fast on nearly sorted data and works well for small arrays.',
	when: ['Small arrays', 'Nearly sorted data', 'Online/incremental sorting'],
	avoid: ['Large random datasets'],
	time: { best: 'O(n)', avg: 'O(n^2)', worst: 'O(n^2)' },
	space: 'O(1)',
	flags: { stable: true, inPlace: true }
};

export const java = `public class InsertionSort {
    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }
}`;
