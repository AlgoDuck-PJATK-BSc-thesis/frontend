export const meta = {
	title: 'Dynamic Array',
	what: 'An array that grows automatically when full. Provides fast indexed access with amortized append.',
	when: ['Need fast random access', 'Mostly append at the end', 'Cache-friendly iteration'],
	avoid: ['Frequent inserts/removals in the middle', 'Need stable O(1) insert/delete at head'],
	time: { best: 'O(1)', avg: 'O(1) amortized append', worst: 'O(n) resize/shift' },
	space: 'O(n)',
	flags: { randomAccess: true, amortized: true }
};

export const java = `public class DynamicArray {
    private int[] data;
    private int size;

    public DynamicArray() {
        data = new int[8];
        size = 0;
    }

    public int size() {
        return size;
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
        data[size++] = value;
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
