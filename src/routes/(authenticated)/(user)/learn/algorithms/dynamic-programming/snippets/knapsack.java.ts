export const meta = {
	title: '0/1 Knapsack',
	what: 'Max value with capacity constraint where each item is used at most once.',
	when: ['Pick items under a limit', 'Budget or weight-constrained selection'],
	avoid: ['Fractions allowed (use fractional knapsack greedy)'],
	time: { avg: 'O(nW)' },
	space: 'O(nW)',
	flags: { constraint: '0/1' }
};

export const java = `public class Knapsack01 {
    static class Item {
        int w;
        int v;
        Item(int w, int v) { this.w = w; this.v = v; }
    }

    public static int solve(Item[] items, int cap) {
        int n = items.length;
        int[][] dp = new int[n + 1][cap + 1];

        for (int i = 1; i <= n; i++) {
            for (int c = 1; c <= cap; c++) {
                Item it = items[i - 1];
                if (it.w <= c) dp[i][c] = Math.max(it.v + dp[i - 1][c - it.w], dp[i - 1][c]);
                else dp[i][c] = dp[i - 1][c];
            }
        }

        return dp[n][cap];
    }
}
`;
