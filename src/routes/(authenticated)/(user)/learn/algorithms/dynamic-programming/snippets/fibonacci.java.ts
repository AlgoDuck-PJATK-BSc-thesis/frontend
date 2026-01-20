export const meta = {
	title: 'Fibonacci (Tabulation)',
	what: 'Fills a table from the base cases upward. Each entry uses two previously computed values: F(i) = F(i-1) + F(i-2). This avoids the repeated work of naive recursion.',
	when: ['Intro to DP', 'You want F(n) quickly for small/medium n'],
	avoid: ['Very large n without big-integer handling'],
	time: { worst: 'O(n)' },
	space: 'O(n)',
	flags: { technique: 'tabulation' }
};

export const java = `public class FibonacciTabulation {
    public static long fib(int n) {
        if (n <= 1) return n;
        long[] dp = new long[n + 1];
        dp[0] = 0;
        dp[1] = 1;

        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }

        return dp[n];
    }
}
`;
