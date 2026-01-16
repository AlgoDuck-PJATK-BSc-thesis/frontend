export const meta = {
	title: 'Fractional Knapsack',
	what: 'You have items with (weight, value) and a capacity limit. Unlike 0/1 knapsack, you are allowed to take a fraction of an item. The greedy rule is: always take from the item with the highest value-per-weight ratio first. If the item does not fully fit, take only the fraction that fits. This is optimal because every unit of capacity is spent on the best available value rate.',
	when: [
		'Fractions are allowed',
		'You want maximum total value under a weight limit',
		'You can compare items by value/weight'
	],
	avoid: [
		'You must take whole items only (0/1 knapsack needs DP)',
		'Items have constraints beyond weight/value ratio'
	],
	time: { avg: 'O(n^2) (simple sort) / O(n log n) (with fast sort)', worst: 'O(n^2)' },
	space: 'O(1)'
};

export const java = `public class FractionalKnapsack {
    public static double maxValue(int[] weight, int[] value, int capacity) {
        int n = weight.length;
        if (n == 0 || capacity <= 0) return 0.0;

        int[] w = new int[n];
        int[] v = new int[n];
        double[] r = new double[n];

        for (int i = 0; i < n; i++) {
            w[i] = weight[i];
            v[i] = value[i];
            r[i] = w[i] == 0 ? 0.0 : (double) v[i] / (double) w[i];
        }

        for (int i = 1; i < n; i++) {
            int tw = w[i];
            int tv = v[i];
            double tr = r[i];
            int j = i - 1;

            while (j >= 0 && r[j] < tr) {
                w[j + 1] = w[j];
                v[j + 1] = v[j];
                r[j + 1] = r[j];
                j--;
            }

            w[j + 1] = tw;
            v[j + 1] = tv;
            r[j + 1] = tr;
        }

        int rem = capacity;
        double total = 0.0;

        for (int i = 0; i < n && rem > 0; i++) {
            if (w[i] <= 0) continue;

            if (w[i] <= rem) {
                total += (double) v[i];
                rem -= w[i];
            } else {
                double f = (double) rem / (double) w[i];
                total += (double) v[i] * f;
                rem = 0;
            }
        }

        return total;
    }
}
`;
