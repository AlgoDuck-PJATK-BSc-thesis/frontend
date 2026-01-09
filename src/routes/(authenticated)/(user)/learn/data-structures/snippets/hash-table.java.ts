export const meta = {
	title: 'Hash Table (Separate Chaining)',
	what: 'Maps keys to buckets using a hash function. Collisions are handled by storing a list in each bucket.',
	when: ['Need fast key→value lookups', 'Implement sets/maps', 'Caching and indexing'],
	avoid: ['Need ordered iteration', 'Worst-case guarantees are required without extra structure'],
	time: { best: 'O(1)', avg: 'O(1)', worst: 'O(n)' },
	space: 'O(n)',
	flags: { collisions: 'chaining' }
};

export const java = `import java.util.*;

public class HashTable {
    private static class Entry {
        String key;
        int value;
        Entry(String key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    private final List<Entry>[] table;

    @SuppressWarnings("unchecked")
    public HashTable(int capacity) {
        table = (List<Entry>[]) new List[capacity];
        for (int i = 0; i < capacity; i++) table[i] = new LinkedList<>();
    }

    private int index(String key) {
        return Math.abs(key.hashCode()) % table.length;
    }

    public void put(String key, int value) {
        int idx = index(key);
        for (Entry e : table[idx]) {
            if (e.key.equals(key)) {
                e.value = value;
                return;
            }
        }
        table[idx].add(new Entry(key, value));
    }

    public Integer get(String key) {
        int idx = index(key);
        for (Entry e : table[idx]) {
            if (e.key.equals(key)) return e.value;
        }
        return null;
    }

    public void remove(String key) {
        int idx = index(key);
        table[idx].removeIf(e -> e.key.equals(key));
    }

    public boolean containsKey(String key) {
        return get(key) != null;
    }
}`;
