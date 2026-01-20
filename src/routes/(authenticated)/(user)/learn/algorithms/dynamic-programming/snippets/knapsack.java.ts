export const meta = {
	title: '0/1 Knapsack',
	what: 'Uses a grid where dp[i][w] is the best value using the first i items with capacity w. For each item, DP compares skipping it vs taking it (if it fits) and keeps the better value.',
	when: ['Choose items under a capacity', 'Each item can be used once'],
	avoid: ['Fractions allowed (different problem)'],
	time: { worst: 'O(n * W)' },
	space: 'O(n * W)',
	flags: { constraint: '0/1', table: '2D DP' }
};

export const java = `public class Knapsack01 {
    public static int solve(int[] weight, int[] value, int cap) {
        if (cap < 0) return 0;
        int n = weight.length;
        if (value.length != n) return 0;

        int[][] dp = new int[n + 1][cap + 1];

        for (int i = 1; i <= n; i++) {
            int wi = weight[i - 1];
            int vi = value[i - 1];
            for (int w = 0; w <= cap; w++) {
                int skip = dp[i - 1][w];
                int take = skip;
                if (wi <= w) {
                    int cand = vi + dp[i - 1][w - wi];
                    if (cand > take) take = cand;
                }
                dp[i][w] = take;
            }
        }

        return dp[n][cap];
    }
}
`;
