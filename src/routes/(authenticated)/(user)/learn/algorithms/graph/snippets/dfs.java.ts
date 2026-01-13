export const meta = {
	title: 'Depth-First Search (DFS)',
	what: 'Explores one path as far as possible, then backtrack when stuck. Uses a stack (or recursion), so the newest discovered node is explored first.',
	when: ['Exploration', 'Connectivity checks', 'Cycle detection patterns'],
	avoid: ['You need level-by-level order (BFS)'],
	time: { worst: 'O(V+E)' },
	space: 'O(V)',
	flags: { usesStack: true }
};

export const java = `public class DFS {
    public static int[] order(int vertexCount, int[][] adj, int start) {
        if (start < 0 || start >= vertexCount) return new int[0];

        boolean[] seen = new boolean[vertexCount];
        int[] stack = new int[vertexCount];
        int top = 0;

        int[] out = new int[vertexCount];
        int outSize = 0;

        stack[top] = start;
        top++;

        while (top > 0) {
            top--;
            int v = stack[top];

            if (seen[v]) continue;
            seen[v] = true;

            out[outSize] = v;
            outSize++;

            int[] nbrs = adj[v];
            if (nbrs == null) continue;

            for (int i = nbrs.length - 1; i >= 0; i--) {
                int n = nbrs[i];
                if (n < 0 || n >= vertexCount) continue;
                if (!seen[n]) {
                    stack[top] = n;
                    top++;
                }
            }
        }

        int[] res = new int[outSize];
        for (int i = 0; i < outSize; i++) res[i] = out[i];
        return res;
    }
}`;
