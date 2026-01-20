export const meta = {
	title: 'Coin Change (Min Coins)',
	what: 'Builds answers from 0 up to the target. dp[x] stores the fewest coins needed to make x. Start with dp[0]=0 and everything else as INF (unreachable). For each amount x, try each coin c and see if dp[x-c] + 1 improves dp[x].',
	when: ['Minimum coins needed', 'Small/medium amounts', 'Classic 1D DP'],
	avoid: ['You need number of ways (different DP)'],
	time: { worst: 'O(amount * numberOfCoins)' },
	space: 'O(amount)',
	flags: { dimension: '1D DP' }
};

export const java = `public class CoinChangeMin {
    public static int minCoins(int[] coins, int amount) {
        int INF = amount + 1;
        int[] dp = new int[amount + 1];

        for (int i = 0; i <= amount; i++) dp[i] = INF;
        dp[0] = 0;

        for (int x = 1; x <= amount; x++) {
            int best = INF;
            for (int i = 0; i < coins.length; i++) {
                int c = coins[i];
                if (c <= x) {
                    int prev = dp[x - c];
                    if (prev + 1 < best) best = prev + 1;
                }
            }
            dp[x] = best;
        }

        return dp[amount] > amount ? -1 : dp[amount];
    }
}
`;
