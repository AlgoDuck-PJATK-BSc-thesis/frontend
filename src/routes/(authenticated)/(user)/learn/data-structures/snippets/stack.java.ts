export const meta = {
	title: 'Stack',
	what: 'A stack is Last-In, First-Out (LIFO): the most recently pushed item is the first one popped. With an array-backed stack, push/pop only touch the end, so they are O(1).',
	when: ['Undo/redo history', 'Backtracking and DFS', 'Parsing / matching brackets'],
	avoid: ['When you need random access', 'When you need FIFO order'],
	time: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
	space: 'O(n)',
	flags: { order: 'LIFO' }
};

export const java = `public class StackArray {
    private int[] items;
    private int size;

    public StackArray() {
        reset();
    }

    public void reset() {
        items = new int[8];
        size = 0;
        push(1);
        push(2);
        push(3);
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    private void ensureCapacity(int needed) {
        if (needed <= items.length) return;
        int newCap = items.length * 2;
        while (newCap < needed) newCap *= 2;
        int[] next = new int[newCap];
        System.arraycopy(items, 0, next, 0, size);
        items = next;
    }

    public void push(int value) {
        ensureCapacity(size + 1);
        items[size] = value;
        size++;
    }

    public Integer pop() {
        if (size == 0) return null;
        size--;
        return items[size];
    }

    public Integer peek() {
        if (size == 0) return null;
        return items[size - 1];
    }
}`;
