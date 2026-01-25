export const meta = {
	title: 'Hash Table (Separate Chaining)',
	what: 'Stores key to value pairs by hashing the key into a bucket index. If multiple keys map to the same bucket (collision), they are stored in a small linked list inside that bucket. Put updates an existing key or adds a new entry.',
	when: ['Need fast key to value lookups', 'Implement sets/maps', 'Caching and indexing'],
	avoid: [
		'Need ordered iteration',
		'Need guaranteed worst-case performance without extra structure'
	],
	time: { best: 'O(1)', avg: 'O(1) expected', worst: 'O(n)' },
	space: 'O(n)',
	flags: { collisions: 'chaining' }
};

export const java = `public class HashTable {
    private static class Entry {
        String key;
        String value;
        Entry next;

        Entry(String key, String value) {
            this.key = key;
            this.value = value;
            this.next = null;
        }
    }

    private final int capacity;
    private final Entry[] buckets;

    public HashTable() {
        this.capacity = 10;
        this.buckets = new Entry[this.capacity];
    }

    public void reset() {
        for (int i = 0; i < capacity; i++) buckets[i] = null;
    }

    private int index(String key) {
        long h = 0L;
        for (int i = 0; i < key.length(); i++) {
            h = (h * 31L + (int) key.charAt(i)) & 0xffffffffL;
        }
        return (int) (h % capacity);
    }

    public void put(String key, String value) {
        if (key == null || value == null) return;
        String k = key.trim();
        String v = value.trim();
        if (k.length() == 0 || v.length() == 0) return;

        int idx = index(k);
        Entry head = buckets[idx];

        if (head == null) {
            buckets[idx] = new Entry(k, v);
            return;
        }

        Entry cur = head;
        Entry prev = null;

        while (cur != null) {
            if (cur.key.equals(k)) {
                cur.value = v;
                return;
            }
            prev = cur;
            cur = cur.next;
        }

        prev.next = new Entry(k, v);
    }

    public String get(String key) {
        if (key == null) return null;
        String k = key.trim();
        if (k.length() == 0) return null;

        int idx = index(k);
        Entry cur = buckets[idx];

        while (cur != null) {
            if (cur.key.equals(k)) return cur.value;
            cur = cur.next;
        }

        return null;
    }

    public void remove(String key) {
        if (key == null) return;
        String k = key.trim();
        if (k.length() == 0) return;

        int idx = index(k);
        Entry cur = buckets[idx];
        Entry prev = null;

        while (cur != null) {
            if (cur.key.equals(k)) {
                if (prev == null) buckets[idx] = cur.next;
                else prev.next = cur.next;
                return;
            }
            prev = cur;
            cur = cur.next;
        }
    }

    public boolean containsKey(String key) {
        return get(key) != null;
    }
}`;
