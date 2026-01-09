export const meta = {
	title: 'Bellman–Ford',
	what: 'Relaxes all edges repeatedly. Works with negative weights and can detect negative cycles.',
	when: ['Negative weights', 'Cycle detection', 'Directed graphs'],
	avoid: ['When you can use Dijkstra (faster)'],
	time: { worst: 'O(VE)' },
	space: 'O(V)',
	flags: { supportsNegativeWeights: true }
};

export const java = `import java.util.*;

public class BellmanFord {
    static class Edge {
        String a, b;
        int w;
        Edge(String a, String b, int w) { this.a = a; this.b = b; this.w = w; }
    }

    public static Map<String, Integer> run(List<Edge> edges, Set<String> vs, String s) {
        Map<String, Integer> d = new HashMap<>();
        for (String v : vs) d.put(v, Integer.MAX_VALUE);
        d.put(s, 0);

        int V = vs.size();
        for (int i = 0; i < V - 1; i++) {
            for (Edge e : edges) {
                if (d.get(e.a) != Integer.MAX_VALUE) {
                    int nd = d.get(e.a) + e.w;
                    if (nd < d.get(e.b)) d.put(e.b, nd);
                }
            }
        }
        return d;
    }
}`;
