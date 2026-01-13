export const meta = {
	title: 'Dijkstra',
	what: 'Find shortest distances from A when all weights are non-negative. It repeatedly pick the unvisited node with the smallest known distance and “finalize” it.',
	when: ['Routing / navigation', 'Non-negative weighted graphs', 'Single-source shortest paths'],
	avoid: ['Any negative edge weight (use Bellman-Ford)'],
	time: { worst: 'O((V+E) log V)' },
	space: 'O(V)',
	flags: { nonNegativeWeights: true, usesPriorityQueue: true }
};

export const java = `public class Dijkstra {
    public static final long INF = Long.MAX_VALUE / 4;

    public static long[] run(int vertexCount, int[] a, int[] b, int[] w, int source, boolean undirected) {
        long[] dist = new long[vertexCount];
        boolean[] done = new boolean[vertexCount];
        for (int i = 0; i < vertexCount; i++) dist[i] = INF;
        if (source < 0 || source >= vertexCount) return dist;
        dist[source] = 0;

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

        for (int it = 0; it < vertexCount; it++) {
            int v = -1;
            long best = INF;

            for (int i = 0; i < vertexCount; i++) {
                if (!done[i] && dist[i] < best) {
                    best = dist[i];
                    v = i;
                }
            }

            if (v == -1) break;
            done[v] = true;

            int e = head[v];
            while (e != -1) {
                int u = to[e];
                long nd = dist[v] + (long) wt[e];
                if (nd < dist[u]) dist[u] = nd;
                e = next[e];
            }
        }

        return dist;
    }
}`;
