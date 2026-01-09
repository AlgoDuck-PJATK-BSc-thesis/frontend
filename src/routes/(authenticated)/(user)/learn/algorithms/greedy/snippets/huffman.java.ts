export const meta = {
	title: 'Huffman Coding',
	what: 'Build optimal prefix-free binary codes by combining the two least frequent symbols repeatedly.',
	when: ['You want optimal prefix codes', 'You have symbol frequencies', 'Compression is the goal'],
	avoid: ['You need a fixed-length code', 'You need to preserve lexicographic ordering of codes'],
	time: { avg: 'O(n log n)', worst: 'O(n log n)' },
	space: 'O(n)'
};

export const java = `import java.util.*;

public class HuffmanCoding {
    static class Node implements Comparable<Node> {
        char ch;
        int freq;
        Node left;
        Node right;

        Node(char ch, int freq) {
            this.ch = ch;
            this.freq = freq;
        }

        Node(int freq, Node left, Node right) {
            this.ch = '\\0';
            this.freq = freq;
            this.left = left;
            this.right = right;
        }

        public int compareTo(Node other) {
            return this.freq - other.freq;
        }
    }

    public static Node build(char[] chars, int[] freqs) {
        PriorityQueue<Node> pq = new PriorityQueue<>();

        for (int i = 0; i < chars.length; i++) {
            pq.offer(new Node(chars[i], freqs[i]));
        }

        while (pq.size() > 1) {
            Node a = pq.poll();
            Node b = pq.poll();
            pq.offer(new Node(a.freq + b.freq, a, b));
        }

        return pq.poll();
    }

    public static void codes(Node root, String prefix, Map<Character, String> out) {
        if (root == null) return;

        if (root.left == null && root.right == null) {
            out.put(root.ch, prefix.length() == 0 ? "0" : prefix);
            return;
        }

        codes(root.left, prefix + "0", out);
        codes(root.right, prefix + "1", out);
    }

    public static void main(String[] args) {
        char[] chars = {'a','b','c','d','e','f'};
        int[] freqs = {5,9,12,13,16,45};

        Node root = build(chars, freqs);
        Map<Character, String> out = new HashMap<>();
        codes(root, "", out);

        for (Map.Entry<Character, String> e : out.entrySet()) {
            System.out.println(e.getKey() + " " + e.getValue());
        }
    }
}`;
