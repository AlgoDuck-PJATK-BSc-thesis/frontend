export const meta = {
	title: 'Bellman-Ford',
	what: 'Finds shortest distances from A by repeatedly trying to improve the current best distances. “Relaxing an edge” means: for an edge A→B with weight w, if distance[A] + w is smaller than distance[B], update distance[B] to that smaller value. It does this for all edges up to V-1 times, because the shortest path can use at most V-1 edges. If any distance can still improve after that, the graph contains a negative cycle.',
	when: [
		'Shortest paths with negative weights',
		'Need to detect negative cycles',
		'Single-source shortest paths'
	],
	avoid: ['All weights are non-negative (Dijkstra is usually faster)'],
	time: { worst: 'O(VE)' },
	space: 'O(V)',
	flags: { detectsNegativeCycles: true, supportsNegativeWeights: true }
};

export const java = `public class BellmanFord {
    public static final long INF = Long.MAX_VALUE / 4;

    public static final class Result {
        public final long[] dist;
        public final boolean hasNegativeCycle;

        public Result(long[] dist, boolean hasNegativeCycle) {
            this.dist = dist;
            this.hasNegativeCycle = hasNegativeCycle;
        }
    }

    public static Result run(int vertexCount, int[] a, int[] b, int[] w, int source, boolean undirected) {
        long[] dist = new long[vertexCount];
        for (int i = 0; i < vertexCount; i++) dist[i] = INF;
        if (source < 0 || source >= vertexCount) return new Result(dist, false);
        dist[source] = 0;

        int m = w.length;

        for (int pass = 0; pass < vertexCount - 1; pass++) {
            boolean changed = false;

            for (int i = 0; i < m; i++) {
                int u = a[i];
                int v = b[i];
                int ww = w[i];

                if (u >= 0 && u < vertexCount && v >= 0 && v < vertexCount) {
                    long du = dist[u];
                    if (du < INF) {
                        long nd = du + (long) ww;
                        if (nd < dist[v]) {
                            dist[v] = nd;
                            changed = true;
                        }
                    }
                    if (undirected) {
                        long dv = dist[v];
                        if (dv < INF) {
                            long nd2 = dv + (long) ww;
                            if (nd2 < dist[u]) {
                                dist[u] = nd2;
                                changed = true;
                            }
                        }
                    }
                }
            }

            if (!changed) break;
        }

        boolean neg = false;
        for (int i = 0; i < m; i++) {
            int u = a[i];
            int v = b[i];
            int ww = w[i];

            if (u >= 0 && u < vertexCount && v >= 0 && v < vertexCount) {
                long du = dist[u];
                if (du < INF && du + (long) ww < dist[v]) {
                    neg = true;
                    break;
                }
                if (undirected) {
                    long dv = dist[v];
                    if (dv < INF && dv + (long) ww < dist[u]) {
                        neg = true;
                        break;
                    }
                }
            }
        }

        return new Result(dist, neg);
    }
}
`;
