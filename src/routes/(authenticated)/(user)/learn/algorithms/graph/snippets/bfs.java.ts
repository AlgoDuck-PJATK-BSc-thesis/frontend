export const meta = {
	title: 'Breadth-First Search (BFS)',
	what: 'BFS visits nodes in layers: first the start, then its neighbors, then neighbors of neighbors. Uses a queue (FIFO) so you expand the oldest discovered node first.',
	when: ['Traversal', 'Shortest path in unweighted graphs', 'Finding levels / distance in edges'],
	avoid: ['You want deep exploration first (DFS)'],
	time: { worst: 'O(V+E)' },
	space: 'O(V)',
	flags: { usesQueue: true, shortestInUnweighted: true }
};

export const java = `public class BFS {
    public static int[] order(int vertexCount, int[][] adj, int start) {
        if (start < 0 || start >= vertexCount) return new int[0];

        boolean[] seen = new boolean[vertexCount];
        int[] queue = new int[vertexCount];
        int head = 0;
        int tail = 0;

        int[] out = new int[vertexCount];
        int outSize = 0;

        seen[start] = true;
        queue[tail] = start;
        tail++;

        while (head < tail) {
            int v = queue[head];
            head++;

            out[outSize] = v;
            outSize++;

            int[] nbrs = adj[v];
            if (nbrs == null) continue;

            for (int i = 0; i < nbrs.length; i++) {
                int n = nbrs[i];
                if (n < 0 || n >= vertexCount) continue;
                if (!seen[n]) {
                    seen[n] = true;
                    queue[tail] = n;
                    tail++;
                }
            }
        }

        int[] res = new int[outSize];
        for (int i = 0; i < outSize; i++) res[i] = out[i];
        return res;
    }
}
`;
