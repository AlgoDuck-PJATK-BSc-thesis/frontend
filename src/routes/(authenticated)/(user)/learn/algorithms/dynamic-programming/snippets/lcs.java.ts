export const meta = {
	title: 'Longest Common Subsequence',
	what: 'DP table stores the best LCS length for prefixes of both strings.',
	when: ['Diff-like comparisons', 'Sequence similarity tasks'],
	avoid: ['Need contiguous match (use longest common substring)'],
	time: { avg: 'O(mn)' },
	space: 'O(mn)',
	flags: { output: 'length or sequence' }
};

export const java = `public class LCS {
    public static int length(String a, String b) {
        int m = a.length();
        int n = b.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }

        return dp[m][n];
    }
}
`;
