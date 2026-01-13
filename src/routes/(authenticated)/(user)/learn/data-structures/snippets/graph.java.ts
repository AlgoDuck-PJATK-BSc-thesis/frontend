export const meta = {
	title: 'Graph (Adjacency List)',
	what: 'A graph is nodes connected by edges. An adjacency list stores, for each node, the list of its neighbors. Breadth-First Search (BFS) visits in layers using a queue. Depth-First Search (DFS) goes deep first using recursion (or a stack). The exact visit order depends on neighbor order in the adjacency list.',
	when: [
		'Model networks, dependencies, routes',
		'Use Breadth-First Search (BFS) / Depth-First Search (DFS)',
		'Graph algorithms (shortest paths, MST)'
	],
	avoid: [
		'Dense graphs where an adjacency matrix is simpler',
		'Need many O(1) edge-existence checks (matrix is better)'
	],
	time: { best: 'BFS/DFS O(V+E)', avg: 'BFS/DFS O(V+E)', worst: 'BFS/DFS O(V+E)' },
	space: 'O(V+E)',
	flags: { representation: 'adjacency list', directed: false }
};

export const java = `public class Graph {
    private final String[] nodes;
    private final int[][] adj;

    public Graph() {
        nodes = new String[] {"A", "B", "C", "D", "E", "F", "G", "H"};
        adj = new int[][] {
            {1, 3},
            {0, 2, 4},
            {1, 5},
            {0, 4, 6},
            {1, 3, 5, 7},
            {2, 4, 7},
            {3, 7},
            {4, 5, 6}
        };
    }

    private int idx(String v) {
        if (v == null || v.length() == 0) return -1;
        int i = v.charAt(0) - 'A';
        if (i < 0 || i >= nodes.length) return -1;
        return i;
    }

    public String[] bfs(String start) {
        int s = idx(start);
        if (s == -1) return new String[0];

        boolean[] seen = new boolean[nodes.length];
        int[] q = new int[nodes.length];
        int head = 0;
        int tail = 0;

        String[] out = new String[nodes.length];
        int outSize = 0;

        seen[s] = true;
        q[tail] = s;
        tail++;

        while (head < tail) {
            int v = q[head];
            head++;

            out[outSize] = nodes[v];
            outSize++;

            int[] nbrs = adj[v];
            for (int i = 0; i < nbrs.length; i++) {
                int nb = nbrs[i];
                if (!seen[nb]) {
                    seen[nb] = true;
                    q[tail] = nb;
                    tail++;
                }
            }
        }

        String[] res = new String[outSize];
        for (int i = 0; i < outSize; i++) res[i] = out[i];
        return res;
    }

    public String[] dfs(String start) {
        int s = idx(start);
        if (s == -1) return new String[0];

        boolean[] seen = new boolean[nodes.length];
        String[] out = new String[nodes.length];
        int[] outSize = new int[] {0};

        dfsRec(s, seen, out, outSize);

        String[] res = new String[outSize[0]];
        for (int i = 0; i < outSize[0]; i++) res[i] = out[i];
        return res;
    }

    private void dfsRec(int v, boolean[] seen, String[] out, int[] outSize) {
        seen[v] = true;
        out[outSize[0]] = nodes[v];
        outSize[0] = outSize[0] + 1;

        int[] nbrs = adj[v];
        for (int i = 0; i < nbrs.length; i++) {
            int nb = nbrs[i];
            if (!seen[nb]) dfsRec(nb, seen, out, outSize);
        }
    }
}`;
