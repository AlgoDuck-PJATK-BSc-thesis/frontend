export const meta = {
	title: 'Quick Sort',
	what: 'Partitions around a pivot; recursively sorts partitions.',
	when: ['Fast average-case', 'In-place needed', 'General purpose'],
	avoid: ['Adversarial inputs without randomized pivot', 'Stability required'],
	time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n^2)' },
	space: 'O(log n)',
	flags: { stable: false, inPlace: true }
};

export const java = `public class QuickSort {
    public static void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        quickSort(a, lo, p - 1);
        quickSort(a, p + 1, hi);
    }

    static int partition(int[] a, int lo, int hi) {
        int pivot = a[hi];
        int i = lo - 1;
        for (int j = lo; j < hi; j++) {
            if (a[j] < pivot) {
                i++;
                int t = a[i]; a[i] = a[j]; a[j] = t;
            }
        }
        int t = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t;
        return i + 1;
    }
}`;
