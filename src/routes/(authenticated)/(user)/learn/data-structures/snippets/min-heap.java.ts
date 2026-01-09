export const meta = {
	title: 'Min Heap',
	what: 'A complete binary tree where every parent is <= its children. Great for priority queues and fast min extraction.',
	when: [
		'Need repeated min extraction',
		'Implement priority queue',
		'Dijkstra/A* uses priority queues'
	],
	avoid: ['Need ordered iteration', 'Need fast lookup of arbitrary values'],
	time: { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)' },
	space: 'O(n)',
	flags: { root: 'min' }
};

export const java = `public class MinHeap {
    private int[] heap;
    private int size;

    public MinHeap(int capacity) {
        heap = new int[capacity];
        size = 0;
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
        if (size == heap.length) throw new RuntimeException("Heap full");
        heap[size] = value;
        int i = size;
        size++;

        while (i > 0 && heap[i] < heap[parent(i)]) {
            swap(i, parent(i));
            i = parent(i);
        }
    }

    public int peek() {
        if (size == 0) throw new RuntimeException("Heap empty");
        return heap[0];
    }

    public int extractMin() {
        if (size == 0) throw new RuntimeException("Heap empty");
        int min = heap[0];
        heap[0] = heap[size - 1];
        size--;
        heapify(0);
        return min;
    }

    private void heapify(int i) {
        while (true) {
            int l = left(i);
            int r = right(i);
            int best = i;

            if (l < size && heap[l] < heap[best]) best = l;
            if (r < size && heap[r] < heap[best]) best = r;

            if (best != i) {
                swap(i, best);
                i = best;
            } else {
                break;
            }
        }
    }
}`;
