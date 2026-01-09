export const meta = {
	title: 'Merge Sort',
	what: 'Divide-and-conquer: split array, sort halves, then merge sorted halves.',
	when: ['Stable sort needed', 'Large datasets', 'Linked lists'],
	avoid: ['When extra memory is tight'],
	time: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
	space: 'O(n)',
	flags: { stable: true, inPlace: false }
};

export const java = `public class MergeSort {
    public static void mergeSort(int[] a, int l, int r) {
        if (l >= r) return;
        int m = l + (r - l) / 2;
        mergeSort(a, l, m);
        mergeSort(a, m + 1, r);
        merge(a, l, m, r);
    }

    static void merge(int[] a, int l, int m, int r) {
        int n1 = m - l + 1, n2 = r - m;
        int[] L = new int[n1];
        int[] R = new int[n2];
        for (int i = 0; i < n1; i++) L[i] = a[l + i];
        for (int j = 0; j < n2; j++) R[j] = a[m + 1 + j];
        int i = 0, j = 0, k = l;
        while (i < n1 && j < n2) a[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
        while (i < n1) a[k++] = L[i++];
        while (j < n2) a[k++] = R[j++];
    }
}`;
