export const meta = {
	title: 'Graph (Adjacency List)',
	what: 'A set of vertices connected by edges. Adjacency lists store neighbors efficiently for sparse graphs.',
	when: [
		'Model networks, dependencies, routes',
		'Use BFS/DFS traversals',
		'Graph algorithms (shortest paths, MST)'
	],
	avoid: [
		'Dense graphs where adjacency matrix is simpler',
		'Need O(1) edge existence check for many queries'
	],
	time: { best: 'O(1)', avg: 'BFS/DFS O(V+E)', worst: 'BFS/DFS O(V+E)' },
	space: 'O(V+E)',
	flags: { representation: 'adjacency list', directed: false }
};

export const java = `import java.util.*;

public class Graph {
    private final Map<String, List<String>> adj = new HashMap<>();

    public void addVertex(String v) {
        adj.putIfAbsent(v, new ArrayList<>());
    }

    public void addEdge(String a, String b) {
        addVertex(a);
        addVertex(b);
        adj.get(a).add(b);
        adj.get(b).add(a);
    }

    public List<String> neighbors(String v) {
        return adj.getOrDefault(v, Collections.emptyList());
    }

    public List<String> bfs(String start) {
        if (!adj.containsKey(start)) return Collections.emptyList();
        List<String> order = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        Queue<String> q = new ArrayDeque<>();

        seen.add(start);
        q.add(start);

        while (!q.isEmpty()) {
            String v = q.remove();
            order.add(v);
            for (String nb : neighbors(v)) {
                if (seen.add(nb)) q.add(nb);
            }
        }
        return order;
    }

    public List<String> dfs(String start) {
        if (!adj.containsKey(start)) return Collections.emptyList();
        List<String> order = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        dfsRec(start, seen, order);
        return order;
    }

    private void dfsRec(String v, Set<String> seen, List<String> order) {
        seen.add(v);
        order.add(v);
        for (String nb : neighbors(v)) {
            if (!seen.contains(nb)) dfsRec(nb, seen, order);
        }
    }
}`;
