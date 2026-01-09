export const meta = {
	title: 'Heap Sort',
	what: 'Builds a heap, then extracts elements to produce a sorted array.',
	when: ['Guaranteed O(n log n)', 'Low extra memory'],
	avoid: ['Need stability', 'Usually slower constants than quicksort'],
	time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
	space: 'O(1)',
	flags: { stable: false, inPlace: true }
};

export const java = `public class HeapSort {
    public static void heapSort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) heapify(a, n, i);
        for (int i = n - 1; i > 0; i--) {
            int t = a[0]; a[0] = a[i]; a[i] = t;
            heapify(a, i, 0);
        }
    }

    static void heapify(int[] a, int n, int i) {
        int largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && a[l] > a[largest]) largest = l;
        if (r < n && a[r] > a[largest]) largest = r;
        if (largest != i) {
            int t = a[i]; a[i] = a[largest]; a[largest] = t;
            heapify(a, n, largest);
        }
    }
}`;
