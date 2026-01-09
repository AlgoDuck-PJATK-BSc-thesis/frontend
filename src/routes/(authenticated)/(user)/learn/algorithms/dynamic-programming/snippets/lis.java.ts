export const meta = {
	title: 'Longest Increasing Subsequence',
	what: 'dp[i] = length of the LIS ending at index i.',
	when: ['Sequence analysis', 'Build intuition before O(n log n) version'],
	avoid: ['Need fastest for huge arrays (use n log n variant)'],
	time: { avg: 'O(n^2)' },
	space: 'O(n)',
	flags: { variant: 'quadratic DP' }
};

export const java = `public class LIS {
    public static int lis(int[] a) {
        int n = a.length;
        if (n == 0) return 0;
        int[] dp = new int[n];

        for (int i = 0; i < n; i++) dp[i] = 1;

        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (a[i] > a[j]) dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }

        int best = 0;
        for (int v : dp) best = Math.max(best, v);
        return best;
    }
}
`;
