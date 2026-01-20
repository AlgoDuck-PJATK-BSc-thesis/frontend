export const meta = {
	title: 'Longest Common Subsequence',
	what: 'Builds a table for all prefix pairs. dp[i][j] is the LCS length of a[0..i-1] and b[0..j-1]. Matching letters extend a smaller solved subproblem; otherwise DP keeps the best of dropping one letter from either string.',
	when: ['Comparing two sequences', 'Diff-like problems', 'Similarity scoring'],
	avoid: ['You need contiguous matches (different problem)'],
	time: { worst: 'O(m * n)' },
	space: 'O(m * n)',
	flags: { output: 'length or sequence' }
};

export const java = `public class LCS {
    public static int length(String a, String b) {
        if (a == null || b == null) return 0;
        int m = a.length();
        int n = b.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            char ca = a.charAt(i - 1);
            for (int j = 1; j <= n; j++) {
                char cb = b.charAt(j - 1);
                if (ca == cb) dp[i][j] = dp[i - 1][j - 1] + 1;
                else {
                    int x = dp[i - 1][j];
                    int y = dp[i][j - 1];
                    dp[i][j] = x >= y ? x : y;
                }
            }
        }

        return dp[m][n];
    }
}
`;
