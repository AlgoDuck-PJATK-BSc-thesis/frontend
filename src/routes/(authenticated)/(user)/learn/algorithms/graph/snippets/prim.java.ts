export const meta = {
	title: 'Prim',
	what: 'Grows an MST by repeatedly choosing the cheapest edge leaving the visited set.',
	when: ['Dense graphs', 'Adjacency list available', 'MST required'],
	avoid: ['If you need shortest paths (not MST)'],
	time: { worst: 'O((V+E) log V)' },
	space: 'O(V)',
	flags: { growsFromStart: true }
};

export const java = `import java.util.*;

public class Prim {
    static class Edge {
        String to;
        int w;
        Edge(String to, int w) { this.to = to; this.w = w; }
    }

    static class Node implements Comparable<Node> {
        String v;
        int w;
        Node(String v, int w) { this.v = v; this.w = w; }
        public int compareTo(Node o) { return Integer.compare(w, o.w); }
    }

    public static List<String> mst(Map<String, List<Edge>> g, String start) {
        Set<String> seen = new HashSet<>();
        PriorityQueue<Node> pq = new PriorityQueue<>();
        List<String> order = new ArrayList<>();

        pq.add(new Node(start, 0));

        while (!pq.isEmpty()) {
            Node cur = pq.poll();
            if (seen.contains(cur.v)) continue;
            seen.add(cur.v);
            order.add(cur.v);

            for (Edge e : g.get(cur.v)) {
                if (!seen.contains(e.to)) pq.add(new Node(e.to, e.w));
            }
        }
        return order;
    }
}`;
