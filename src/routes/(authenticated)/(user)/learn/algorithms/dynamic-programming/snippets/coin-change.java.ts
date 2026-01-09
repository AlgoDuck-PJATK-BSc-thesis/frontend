export const meta = {
	title: 'Coin Change (Min Coins)',
	what: 'dp[x] = minimum number of coins required to make amount x.',
	when: ['Need optimal coin count', 'Classic 1D DP'],
	avoid: ['Need number of ways (different DP)'],
	time: { avg: 'O(amount * coins)' },
	space: 'O(amount)',
	flags: { dimension: '1D DP' }
};

export const java = `import java.util.*;

public class CoinChangeMin {
    public static int minCoins(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;

        for (int x = 1; x <= amount; x++) {
            for (int c : coins) {
                if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1);
            }
        }

        return dp[amount] > amount ? -1 : dp[amount];
    }
}
`;
