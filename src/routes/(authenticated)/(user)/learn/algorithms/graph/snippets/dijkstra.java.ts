export const meta = {
	title: 'Dijkstra',
	what: 'Computes shortest distances from one source with non-negative weights.',
	when: ['Road networks', 'Routing', 'Non-negative weighted graphs'],
	avoid: ['Negative edges'],
	time: { worst: 'O((V+E) log V)' },
	space: 'O(V)',
	flags: { nonNegativeWeights: true }
};

export const java = `import java.util.*;

public class Dijkstra {
    static class Edge {
        String to;
        int w;
        Edge(String to, int w) { this.to = to; this.w = w; }
    }

    static class Node implements Comparable<Node> {
        String v;
        int d;
        Node(String v, int d) { this.v = v; this.d = d; }
        public int compareTo(Node o) { return Integer.compare(d, o.d); }
    }

    public static Map<String, Integer> run(Map<String, List<Edge>> g, String s) {
        Map<String, Integer> dist = new HashMap<>();
        for (String v : g.keySet()) dist.put(v, Integer.MAX_VALUE);
        dist.put(s, 0);

        PriorityQueue<Node> pq = new PriorityQueue<>();
        pq.add(new Node(s, 0));
        Set<String> done = new HashSet<>();

        while (!pq.isEmpty()) {
            Node cur = pq.poll();
            if (done.contains(cur.v)) continue;
            done.add(cur.v);

            for (Edge e : g.get(cur.v)) {
                if (dist.get(cur.v) == Integer.MAX_VALUE) continue;
                int nd = dist.get(cur.v) + e.w;
                if (nd < dist.get(e.to)) {
                    dist.put(e.to, nd);
                    pq.add(new Node(e.to, nd));
                }
            }
        }
        return dist;
    }
}`;
