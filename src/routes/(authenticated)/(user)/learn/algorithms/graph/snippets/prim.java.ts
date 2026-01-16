export const meta = {
	title: 'Prim',
	what: 'Builds a Minimum Spanning Tree (MST): V-1 edges that connect all nodes with minimum total weight. It starts from A and repeatedly takes the cheapest edge that connects the visited set to a new node.',
	when: ['Minimum Spanning Tree (MST)', 'Dense graphs', 'Adjacency list available'],
	avoid: ['You need shortest paths (not MST)'],
	time: { worst: 'O(E log V)' },
	space: 'O(V)',
	flags: { minimumSpanningTree: true, growsFromStart: true, result: 'V-1 edges' }
};

export const java = `public class Prim {
    public static final long INF = Long.MAX_VALUE / 4;

    public static int[][] mst(int vertexCount, int[] a, int[] b, int[] w, int start, boolean undirected) {
        if (vertexCount <= 0 || start < 0 || start >= vertexCount) return new int[0][3];

        int m = w.length;
        int edgeCount = undirected ? 2 * m : m;

        int[] head = new int[vertexCount];
        for (int i = 0; i < vertexCount; i++) head[i] = -1;

        int[] to = new int[edgeCount];
        int[] wt = new int[edgeCount];
        int[] next = new int[edgeCount];

        int ei = 0;
        for (int i = 0; i < m; i++) {
            int u = a[i];
            int v = b[i];
            if (u < 0 || u >= vertexCount || v < 0 || v >= vertexCount) continue;

            to[ei] = v;
            wt[ei] = w[i];
            next[ei] = head[u];
            head[u] = ei;
            ei++;

            if (undirected) {
                to[ei] = u;
                wt[ei] = w[i];
                next[ei] = head[v];
                head[v] = ei;
                ei++;
            }
        }

        boolean[] in = new boolean[vertexCount];
        long[] bestW = new long[vertexCount];
        int[] bestFrom = new int[vertexCount];

        for (int i = 0; i < vertexCount; i++) {
            bestW[i] = INF;
            bestFrom[i] = -1;
        }

        bestW[start] = 0;

        int[][] out = new int[Math.max(0, vertexCount - 1)][3];
        int outSize = 0;

        for (int it = 0; it < vertexCount; it++) {
            int v = -1;
            long best = INF;

            for (int i = 0; i < vertexCount; i++) {
                if (!in[i] && bestW[i] < best) {
                    best = bestW[i];
                    v = i;
                }
            }

            if (v == -1) break;
            in[v] = true;

            if (v != start && bestFrom[v] != -1) {
                out[outSize][0] = bestFrom[v];
                out[outSize][1] = v;
                out[outSize][2] = (int) bestW[v];
                outSize++;
            }

            int e = head[v];
            while (e != -1) {
                int u = to[e];
                if (!in[u] && wt[e] < bestW[u]) {
                    bestW[u] = wt[e];
                    bestFrom[u] = v;
                }
                e = next[e];
            }
        }

        int[][] res = new int[outSize][3];
        for (int i = 0; i < outSize; i++) {
            res[i][0] = out[i][0];
            res[i][1] = out[i][1];
            res[i][2] = out[i][2];
        }
        return res;
    }
}
`;
