export const meta = {
	title: 'Trie (Prefix Tree)',
	what: 'A trie stores words by sharing common prefixes. Each node represents a prefix, and children represent the next character. This makes prefix checks fast: to test a prefix, you follow its characters down the tree. Autocomplete is “go to the prefix node, then list all words below it”.',
	when: ['Autocomplete/search-as-you-type', 'Prefix filtering', 'Dictionary word lookups'],
	avoid: ['Memory is tight (tries can be large)', 'You only need exact lookup with small sets'],
	time: { best: 'O(L)', avg: 'O(L)', worst: 'O(L)' },
	space: 'O(total characters)',
	flags: { L: 'word length', supportsPrefix: true }
};

export const java = `public class Trie {
    static class Node {
        Node[] next;
        boolean end;

        Node() {
            next = new Node[26];
            end = false;
        }
    }

    private Node root;

    public Trie() {
        reset();
    }

    public void reset() {
        root = new Node();
        insert("cat");
        insert("car");
        insert("card");
        insert("care");
        insert("dog");
        insert("dodge");
    }

    private int toIdx(char c) {
        int x = c - 'a';
        if (x < 0 || x >= 26) return -1;
        return x;
    }

    public void insert(String word) {
        if (word == null) return;
        String w = word.trim().toLowerCase();
        if (w.length() == 0) return;

        Node cur = root;
        for (int i = 0; i < w.length(); i++) {
            int id = toIdx(w.charAt(i));
            if (id == -1) return;
            if (cur.next[id] == null) cur.next[id] = new Node();
            cur = cur.next[id];
        }
        cur.end = true;
    }

    public boolean search(String word) {
        Node cur = walk(word);
        return cur != null && cur.end;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }

    private Node walk(String s) {
        if (s == null) return null;
        String w = s.trim().toLowerCase();
        if (w.length() == 0) return root;

        Node cur = root;
        for (int i = 0; i < w.length(); i++) {
            int id = toIdx(w.charAt(i));
            if (id == -1) return null;
            cur = cur.next[id];
            if (cur == null) return null;
        }
        return cur;
    }

    static class StringList {
        private String[] a;
        private int size;

        StringList() {
            a = new String[8];
            size = 0;
        }

        void add(String s) {
            if (size == a.length) {
                String[] next = new String[a.length * 2];
                System.arraycopy(a, 0, next, 0, size);
                a = next;
            }
            a[size] = s;
            size++;
        }

        String[] toArray() {
            String[] out = new String[size];
            System.arraycopy(a, 0, out, 0, size);
            return out;
        }
    }

    public String[] autocomplete(String prefix) {
        if (prefix == null) return new String[0];
        String p = prefix.trim().toLowerCase();

        Node cur = root;
        for (int i = 0; i < p.length(); i++) {
            int id = toIdx(p.charAt(i));
            if (id == -1) return new String[0];
            cur = cur.next[id];
            if (cur == null) return new String[0];
        }

        StringList out = new StringList();
        StringBuilder sb = new StringBuilder(p);
        dfs(cur, sb, out);
        return out.toArray();
    }

    private void dfs(Node node, StringBuilder sb, StringList out) {
        if (node.end) out.add(sb.toString());
        for (int i = 0; i < 26; i++) {
            if (node.next[i] != null) {
                sb.append((char)('a' + i));
                dfs(node.next[i], sb, out);
                sb.deleteCharAt(sb.length() - 1);
            }
        }
    }
}`;
