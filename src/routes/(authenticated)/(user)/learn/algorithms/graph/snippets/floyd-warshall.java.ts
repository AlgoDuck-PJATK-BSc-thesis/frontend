export const meta = {
	title: 'Floyd-Warshall',
	what: 'Finds shortest distances between every pair of nodes. It starts with direct edge distances, then tries each node as a possible intermediate step to see if going through it makes any route shorter.',
	when: ['All-pairs shortest paths', 'Many distance queries on the same small/medium graph'],
	avoid: ['Very large graphs (O(V^3) is too slow)'],
	time: { worst: 'O(V^3)' },
	space: 'O(V^2)',
	flags: { allPairs: true }
};

export const java = `public class FloydWarshall {
    public static final long INF = 1_000_000_000_000L;

    public static long[][] allPairsShortestPaths(long[][] g) {
        int n = g.length;
        long[][] d = new long[n][n];

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                d[i][j] = g[i][j];
            }
        }

        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                if (d[i][k] >= INF) continue;
                for (int j = 0; j < n; j++) {
                    if (d[k][j] >= INF) continue;
                    long nd = d[i][k] + d[k][j];
                    if (nd < d[i][j]) d[i][j] = nd;
                }
            }
        }

        return d;
    }
}`;
