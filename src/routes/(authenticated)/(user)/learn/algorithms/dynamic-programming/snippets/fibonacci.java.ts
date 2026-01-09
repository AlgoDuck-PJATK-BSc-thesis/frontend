export const meta = {
	title: 'Fibonacci (DP)',
	what: 'Compute Fibonacci numbers bottom-up using a DP table.',
	when: ['You need F(n) quickly', 'Classic intro DP example'],
	avoid: ['Very large n without big integer handling'],
	time: { avg: 'O(n)' },
	space: 'O(n)',
	flags: { technique: 'tabulation' }
};

export const java = `public class FibonacciDP {
    public static int fib(int n) {
        if (n <= 1) return n;
        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }
}
`;
