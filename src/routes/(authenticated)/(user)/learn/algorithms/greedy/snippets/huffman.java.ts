export const meta = {
	title: 'Huffman Coding',
	what: 'You start with symbols and their frequencies. Repeatedly combine the two smallest frequencies into a new parent node whose frequency is the sum. This builds a binary tree. Reading left as 0 and right as 1 gives a prefix-free code (no code is the prefix of another). More frequent symbols end up with shorter codes, which reduces the total encoded length.',
	when: [
		'You have symbol frequencies',
		'You want optimal prefix-free binary codes',
		'Compression is the goal'
	],
	avoid: ['You need fixed-length codes', 'You must preserve a specific ordering of codes'],
	time: { avg: 'O(n^2) (simple two-min selection)', worst: 'O(n^2)' },
	space: 'O(n)'
};

export const java = `public class HuffmanCoding {
    public static String[] buildCodes(char[] chars, int[] freqs) {
        int n = chars.length;
        if (n == 0) return new String[0];

        int maxNodes = 2 * n - 1;
        int[] left = new int[maxNodes];
        int[] right = new int[maxNodes];
        int[] freq = new int[maxNodes];
        char[] ch = new char[maxNodes];
        boolean[] alive = new boolean[maxNodes];

        for (int i = 0; i < maxNodes; i++) {
            left[i] = -1;
            right[i] = -1;
            freq[i] = 0;
            ch[i] = 0;
            alive[i] = false;
        }

        for (int i = 0; i < n; i++) {
            freq[i] = freqs[i];
            ch[i] = chars[i];
            alive[i] = true;
        }

        int size = n;

        while (countAlive(alive, size) > 1) {
            int a = pickMin(alive, freq, size, -1);
            int b = pickMin(alive, freq, size, a);

            alive[a] = false;
            alive[b] = false;

            freq[size] = freq[a] + freq[b];
            left[size] = a;
            right[size] = b;
            alive[size] = true;

            size++;
        }

        int root = -1;
        for (int i = 0; i < size; i++) if (alive[i]) root = i;

        String[] out = new String[n];
        if (n == 1) {
            out[0] = "0";
            return out;
        }

        dfs(root, "", left, right, ch, chars, out);
        return out;
    }

    private static void dfs(int node, String prefix, int[] left, int[] right, char[] ch, char[] chars, String[] out) {
        if (node < 0) return;

        if (left[node] == -1 && right[node] == -1) {
            char c = ch[node];
            int idx = indexOf(chars, c);
            if (idx >= 0) out[idx] = prefix.length() == 0 ? "0" : prefix;
            return;
        }

        dfs(left[node], prefix + "0", left, right, ch, chars, out);
        dfs(right[node], prefix + "1", left, right, ch, chars, out);
    }

    private static int indexOf(char[] a, char x) {
        for (int i = 0; i < a.length; i++) if (a[i] == x) return i;
        return -1;
    }

    private static int countAlive(boolean[] alive, int size) {
        int c = 0;
        for (int i = 0; i < size; i++) if (alive[i]) c++;
        return c;
    }

    private static int pickMin(boolean[] alive, int[] freq, int size, int skip) {
        int best = -1;
        for (int i = 0; i < size; i++) {
            if (!alive[i]) continue;
            if (i == skip) continue;
            if (best == -1 || freq[i] < freq[best]) best = i;
        }
        return best;
    }
}
`;
