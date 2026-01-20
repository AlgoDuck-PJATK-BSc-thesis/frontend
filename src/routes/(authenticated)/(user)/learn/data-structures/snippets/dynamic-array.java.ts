export const meta = {
	title: 'Dynamic Array',
	what: 'A resizable array that tracks size (used slots) and capacity (allocated slots). Index access is O(1). Appending is usually O(1), but when full it grows (often doubles) and copies elements, making that single append O(n). Over many appends, the average is amortized O(1).',
	when: ['Need fast random access', 'Mostly append at the end', 'Cache-friendly iteration'],
	avoid: [
		'Frequent inserts/removals in the middle',
		'Need fast deletes from the front without shifting'
	],
	time: {
		best: 'access O(1)',
		avg: 'append O(1) amortized',
		worst: 'append O(n) resize; insert/remove middle O(n)'
	},
	space: 'O(n)',
	flags: { randomAccess: true, amortized: true }
};

export const java = `public class DynamicArray {
    private int[] data;
    private int size;

    public DynamicArray() {
        reset();
    }

    public void reset() {
        data = new int[8];
        size = 0;
        add(5);
        add(2);
        add(8);
        add(1);
        add(9);
    }

    public int size() {
        return size;
    }

    public int capacity() {
        return data.length;
    }

    public int get(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
        return data[index];
    }

    public void set(int index, int value) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
        data[index] = value;
    }

    public void add(int value) {
        ensureCapacity(size + 1);
        data[size] = value;
        size++;
    }

    public int addRandom() {
        int v = (int)(Math.random() * 10) + 1;
        add(v);
        return v;
    }

    public void removeLast() {
        if (size == 0) return;
        size--;
    }

    public void insert(int index, int value) {
        if (index < 0 || index > size) throw new IndexOutOfBoundsException();
        ensureCapacity(size + 1);
        for (int i = size; i > index; i--) data[i] = data[i - 1];
        data[index] = value;
        size++;
    }

    public int removeAt(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
        int removed = data[index];
        for (int i = index; i < size - 1; i++) data[i] = data[i + 1];
        size--;
        return removed;
    }

    private void ensureCapacity(int needed) {
        if (needed <= data.length) return;
        int newCap = data.length * 2;
        while (newCap < needed) newCap *= 2;
        int[] next = new int[newCap];
        System.arraycopy(data, 0, next, 0, size);
        data = next;
    }
}`;
