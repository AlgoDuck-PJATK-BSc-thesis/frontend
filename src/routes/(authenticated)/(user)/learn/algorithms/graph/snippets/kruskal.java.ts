export const meta = {
	title: 'Kruskal',
	what: 'Builds a Minimum Spanning Tree (MST), chooses V-1 edges that connect all nodes with the minimum total weight. It sorts edges by weight and add the next cheapest edge only if it does not create a cycle (Union-Find).',
	when: ['Minimum Spanning Tree (MST)', 'Sparse graphs', 'You already have an edge list'],
	avoid: ['You need shortest paths (not MST)'],
	time: { worst: 'O(E log E)' },
	space: 'O(V)',
	flags: { minimumSpanningTree: true, usesUnionFind: true, result: 'V-1 edges' }
};

export const java = `public class Kruskal {
    public static int[][] mst(int vertexCount, int[] a, int[] b, int[] w) {
        int m = w.length;

        int[] A = new int[m];
        int[] B = new int[m];
        int[] W = new int[m];
        for (int i = 0; i < m; i++) {
            A[i] = a[i];
            B[i] = b[i];
            W[i] = w[i];
        }

        for (int i = 1; i < m; i++) {
            int ta = A[i];
            int tb = B[i];
            int tw = W[i];
            int j = i - 1;
            while (j >= 0 && W[j] > tw) {
                A[j + 1] = A[j];
                B[j + 1] = B[j];
                W[j + 1] = W[j];
                j--;
            }
            A[j + 1] = ta;
            B[j + 1] = tb;
            W[j + 1] = tw;
        }

        int[] parent = new int[vertexCount];
        int[] rank = new int[vertexCount];
        for (int i = 0; i < vertexCount; i++) {
            parent[i] = i;
            rank[i] = 0;
        }

        int[][] out = new int[Math.max(0, vertexCount - 1)][3];
        int outSize = 0;

        for (int i = 0; i < m && outSize < vertexCount - 1; i++) {
            int u = A[i];
            int v = B[i];
            if (u < 0 || u >= vertexCount || v < 0 || v >= vertexCount) continue;

            int ru = find(parent, u);
            int rv = find(parent, v);
            if (ru == rv) continue;

            union(parent, rank, ru, rv);

            out[outSize][0] = u;
            out[outSize][1] = v;
            out[outSize][2] = W[i];
            outSize++;
        }

        int[][] res = new int[outSize][3];
        for (int i = 0; i < outSize; i++) {
            res[i][0] = out[i][0];
            res[i][1] = out[i][1];
            res[i][2] = out[i][2];
        }
        return res;
    }

    private static int find(int[] parent, int x) {
        int r = x;
        while (parent[r] != r) r = parent[r];
        while (parent[x] != x) {
            int p = parent[x];
            parent[x] = r;
            x = p;
        }
        return r;
    }

    private static void union(int[] parent, int[] rank, int a, int b) {
        if (rank[a] < rank[b]) parent[a] = b;
        else if (rank[a] > rank[b]) parent[b] = a;
        else {
            parent[b] = a;
            rank[a] = rank[a] + 1;
        }
    }
}
`;
