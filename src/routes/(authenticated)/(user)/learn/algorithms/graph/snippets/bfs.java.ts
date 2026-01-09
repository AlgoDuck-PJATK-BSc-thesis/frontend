export const meta = {
	title: 'BFS',
	what: 'Visits nodes in increasing distance from the start using a queue.',
	when: ['Traversal', 'Shortest path in unweighted graphs', 'Levels / layers'],
	avoid: ['When you need deep exploration first'],
	time: { worst: 'O(V+E)' },
	space: 'O(V)',
	flags: { usesQueue: true }
};

export const java = `import java.util.*;

public class BFS {
    public static void bfs(Map<String, List<String>> g, String start) {
        Set<String> seen = new HashSet<>();
        Queue<String> q = new ArrayDeque<>();
        seen.add(start);
        q.add(start);

        while (!q.isEmpty()) {
            String v = q.remove();
            for (String n : g.get(v)) {
                if (!seen.contains(n)) {
                    seen.add(n);
                    q.add(n);
                }
            }
        }
    }
}`;
