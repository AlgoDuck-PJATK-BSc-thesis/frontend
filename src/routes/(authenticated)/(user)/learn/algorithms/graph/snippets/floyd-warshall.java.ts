export const meta = {
	title: 'Floyd–Warshall',
	what: 'All-pairs shortest paths using dynamic programming over intermediate nodes.',
	when: ['All-pairs distances', 'Small/medium graphs', 'Many queries'],
	avoid: ['Very large graphs (cubic time)'],
	time: { worst: 'O(V^3)' },
	space: 'O(V^2)',
	flags: { allPairs: true }
};

export const java = `public class FloydWarshall {
    static final int INF = 1000000;

    public static int[][] run(int[][] g) {
        int n = g.length;
        int[][] d = new int[n][n];

        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                d[i][j] = g[i][j];

        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (d[i][k] + d[k][j] < d[i][j])
                        d[i][j] = d[i][k] + d[k][j];

        return d;
    }
}`;
