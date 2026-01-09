export const meta = {
	title: 'Trie (Prefix Tree)',
	what: 'Stores strings by shared prefixes. Fast search and prefix queries (autocomplete).',
	when: ['Autocomplete/search-as-you-type', 'Prefix filtering', 'Dictionary word lookups'],
	avoid: ['Memory is tight (tries can be large)', 'You only need exact lookup with small sets'],
	time: { best: 'O(L)', avg: 'O(L)', worst: 'O(L)' },
	space: 'O(total characters)',
	flags: { L: 'word length', supportsPrefix: true }
};

export const java = `import java.util.*;

class TrieNode {
    Map<Character, TrieNode> next = new HashMap<>();
    boolean end = false;
}

public class Trie {
    private final TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            cur.next.putIfAbsent(c, new TrieNode());
            cur = cur.next.get(c);
        }
        cur.end = true;
    }

    public boolean search(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            cur = cur.next.get(c);
            if (cur == null) return false;
        }
        return cur.end;
    }

    public boolean startsWith(String prefix) {
        TrieNode cur = root;
        for (char c : prefix.toCharArray()) {
            cur = cur.next.get(c);
            if (cur == null) return false;
        }
        return true;
    }

    public List<String> autocomplete(String prefix) {
        TrieNode cur = root;
        for (char c : prefix.toCharArray()) {
            cur = cur.next.get(c);
            if (cur == null) return Collections.emptyList();
        }
        List<String> out = new ArrayList<>();
        dfs(cur, new StringBuilder(prefix), out);
        return out;
    }

    private void dfs(TrieNode node, StringBuilder sb, List<String> out) {
        if (node.end) out.add(sb.toString());
        for (Map.Entry<Character, TrieNode> e : node.next.entrySet()) {
            sb.append(e.getKey());
            dfs(e.getValue(), sb, out);
            sb.deleteCharAt(sb.length() - 1);
        }
    }
}`;
