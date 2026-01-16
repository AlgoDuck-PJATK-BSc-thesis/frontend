export const meta = {
	title: 'Queue',
	what: 'A queue is First-In, First-Out (FIFO): the earliest enqueued item is the first one dequeued. A common implementation is a circular array with a front index and a count, so enqueue/dequeue are O(1).',
	when: ['Task scheduling', 'Breadth-first search', 'Streaming pipelines'],
	avoid: ['When you need LIFO behavior', 'When you need random access'],
	time: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
	space: 'O(n)',
	flags: { order: 'FIFO' }
};

export const java = `public class QueueArray {
    private int[] items;
    private int front;
    private int count;

    public QueueArray() {
        reset();
    }

    public void reset() {
        items = new int[8];
        front = 0;
        count = 0;
        enqueue(1);
        enqueue(2);
        enqueue(3);
        enqueue(4);
    }

    public int size() {
        return count;
    }

    public boolean isEmpty() {
        return count == 0;
    }

    private int idx(int offset) {
        int i = front + offset;
        if (i >= items.length) i %= items.length;
        return i;
    }

    private void ensureCapacity(int needed) {
        if (needed <= items.length) return;
        int newCap = items.length * 2;
        while (newCap < needed) newCap *= 2;
        int[] next = new int[newCap];
        for (int i = 0; i < count; i++) next[i] = items[idx(i)];
        items = next;
        front = 0;
    }

    public void enqueue(int value) {
        ensureCapacity(count + 1);
        items[idx(count)] = value;
        count++;
    }

    public Integer dequeue() {
        if (count == 0) return null;
        int value = items[front];
        front++;
        if (front == items.length) front = 0;
        count--;
        return value;
    }

    public Integer peek() {
        if (count == 0) return null;
        return items[front];
    }
}`;
