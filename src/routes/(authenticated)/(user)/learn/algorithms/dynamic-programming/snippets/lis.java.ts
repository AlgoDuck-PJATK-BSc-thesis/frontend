export const meta = {
	title: 'Longest Increasing Subsequence',
	what: 'Computes dp[i] as the length of the longest increasing subsequence that ends at i. For each position i, look back at all j<i and extend the best subsequence that can legally continue (a[j] < a[i]).',
	when: ['Build LIS intuition', 'Small/medium arrays'],
	avoid: ['Huge arrays where you need the fastest variant'],
	time: { worst: 'O(n^2)' },
	space: 'O(n)',
	flags: { variant: 'quadratic DP' }
};

export const java = `public class LIS {
    public static int lis(int[] a) {
        int n = a.length;
        if (n == 0) return 0;

        int[] dp = new int[n];
        for (int i = 0; i < n; i++) dp[i] = 1;

        int best = 1;

        for (int i = 1; i < n; i++) {
            int bi = 1;
            for (int j = 0; j < i; j++) {
                if (a[i] > a[j]) {
                    int cand = dp[j] + 1;
                    if (cand > bi) bi = cand;
                }
            }
            dp[i] = bi;
            if (bi > best) best = bi;
        }

        return best;
    }
}
`;
