export const meta = {
	title: 'Kruskal',
	what: 'Builds a minimum spanning tree by adding cheapest non-cycling edges.',
	when: ['Sparse graphs', 'MST required', 'Edge list available'],
	avoid: ['If you need shortest paths (not MST)'],
	time: { worst: 'O(E log E)' },
	space: 'O(V)',
	flags: { usesUnionFind: true }
};

export const java = `import java.util.*;

public class Kruskal {
    static class Edge implements Comparable<Edge> {
        String a, b;
        int w;
        Edge(String a, String b, int w) { this.a = a; this.b = b; this.w = w; }
        public int compareTo(Edge o) { return Integer.compare(w, o.w); }
    }

    static class DSU {
        Map<String, String> p = new HashMap<>();
        DSU(Set<String> vs) { for (String v : vs) p.put(v, v); }
        String find(String x) { return p.get(x).equals(x) ? x : (p.put(x, find(p.get(x))), p.get(x)); }
        void union(String a, String b) { p.put(find(a), find(b)); }
    }

    public static List<Edge> mst(List<Edge> edges, Set<String> vs) {
        Collections.sort(edges);
        DSU d = new DSU(vs);
        List<Edge> out = new ArrayList<>();
        for (Edge e : edges) {
            if (!d.find(e.a).equals(d.find(e.b))) {
                out.add(e);
                d.union(e.a, e.b);
            }
        }
        return out;
    }
}`;
