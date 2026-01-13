export const meta = {
	title: 'Quick Sort',
	what: 'Partitions the array around a pivot so smaller values go left and larger values go right, then recursively sorts the partitions. It’s usually very fast, but a bad pivot choice can degrade to O(n^2).',
	when: ['Fast average-case', 'In-place needed', 'General purpose'],
	avoid: ['Stability required', 'Adversarial inputs without better pivot strategy'],
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
                int t = a[i];
                a[i] = a[j];
                a[j] = t;
            }
        }
        int t = a[i + 1];
        a[i + 1] = a[hi];
        a[hi] = t;
        return i + 1;
    }
}`;
