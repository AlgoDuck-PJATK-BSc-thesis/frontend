export const meta = {
	title: 'DFS',
	what: 'Explores as far as possible before backtracking (stack or recursion).',
	when: ['Exploration', 'Cycle detection', 'Connectivity checks'],
	avoid: ['When level-order is required'],
	time: { worst: 'O(V+E)' },
	space: 'O(V)',
	flags: { usesStack: true }
};

export const java = `import java.util.*;

public class DFS {
    public static void dfs(Map<String, List<String>> g, String start) {
        Set<String> seen = new HashSet<>();
        Deque<String> st = new ArrayDeque<>();
        st.push(start);

        while (!st.isEmpty()) {
            String v = st.pop();
            if (seen.contains(v)) continue;
            seen.add(v);
            for (String n : g.get(v)) {
                if (!seen.contains(n)) st.push(n);
            }
        }
    }
}`;
