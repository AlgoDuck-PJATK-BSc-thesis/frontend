export const meta = {
	title: 'Max Heap',
	what: 'A max heap is a complete binary tree stored in an array where every parent is greater than or equal to its children. Insert appends at the end and bubbles up. Extract-max removes the root by moving the last element to the top and pushing it down until the heap property is restored.',
	when: ['Need repeated max extraction', 'Implement priority queue', 'Scheduling / heap sort'],
	avoid: ['Need ordered iteration', 'Need fast lookup of arbitrary values'],
	time: { best: 'peek O(1)', avg: 'insert/extract O(log n)', worst: 'insert/extract O(log n)' },
	space: 'O(n)',
	flags: { root: 'max' }
};

export const java = `public class MaxHeap {
    private int[] heap;
    private int size;

    public MaxHeap() {
        reset();
    }

    public void reset() {
        heap = new int[8];
        size = 0;
        insert(100);
        insert(70);
        insert(90);
        insert(40);
        insert(30);
        insert(60);
        insert(80);
    }

    public int size() {
        return size;
    }

    private void ensureCapacity(int needed) {
        if (needed <= heap.length) return;
        int newCap = heap.length * 2;
        while (newCap < needed) newCap *= 2;
        int[] next = new int[newCap];
        System.arraycopy(heap, 0, next, 0, size);
        heap = next;
    }

    private int parent(int i) { return (i - 1) / 2; }
    private int left(int i) { return 2 * i + 1; }
    private int right(int i) { return 2 * i + 2; }

    private void swap(int i, int j) {
        int t = heap[i];
        heap[i] = heap[j];
        heap[j] = t;
    }

    public void insert(int value) {
        ensureCapacity(size + 1);
        heap[size] = value;
        int i = size;
        size++;

        while (i > 0 && heap[i] > heap[parent(i)]) {
            swap(i, parent(i));
            i = parent(i);
        }
    }

    public Integer peek() {
        if (size == 0) return null;
        return heap[0];
    }

    public Integer extractMax() {
        if (size == 0) return null;
        if (size == 1) {
            size = 0;
            return heap[0];
        }
        int max = heap[0];
        heap[0] = heap[size - 1];
        size--;
        heapifyDown(0);
        return max;
    }

    private void heapifyDown(int i) {
        while (true) {
            int l = left(i);
            int r = right(i);
            int best = i;

            if (l < size && heap[l] > heap[best]) best = l;
            if (r < size && heap[r] > heap[best]) best = r;

            if (best != i) {
                swap(i, best);
                i = best;
            } else {
                break;
            }
        }
    }
}`;
