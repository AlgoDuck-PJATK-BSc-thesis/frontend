export const meta = {
	title: 'Heap Sort',
	what: 'Builds a max heap, then repeatedly swaps the root (maximum) with the last element and heapifies the remaining heap. The array becomes sorted from the end backward.',
	when: ['Guaranteed O(n log n)', 'Low extra memory', 'In-place sorting needed'],
	avoid: ['Need stability', 'Often slower constants than quicksort/mergesort in practice'],
	time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
	space: 'O(1)',
	flags: { stable: false, inPlace: true }
};

export const java = `public class HeapSort {
    public static void heapSort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) heapify(a, n, i);
        for (int i = n - 1; i > 0; i--) {
            int t = a[0];
            a[0] = a[i];
            a[i] = t;
            heapify(a, i, 0);
        }
    }

    static void heapify(int[] a, int n, int i) {
        while (true) {
            int largest = i;
            int l = 2 * i + 1;
            int r = 2 * i + 2;

            if (l < n && a[l] > a[largest]) largest = l;
            if (r < n && a[r] > a[largest]) largest = r;

            if (largest != i) {
                int t = a[i];
                a[i] = a[largest];
                a[largest] = t;
                i = largest;
            } else {
                break;
            }
        }
    }
}`;
