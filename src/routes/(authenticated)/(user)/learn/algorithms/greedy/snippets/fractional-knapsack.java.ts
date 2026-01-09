export const meta = {
	title: 'Fractional Knapsack',
	what: 'Maximize value with a weight capacity when you are allowed to take fractions of items. Greedy by value/weight ratio is optimal.',
	when: ['Fractions are allowed', 'You can sort by value/weight ratio', 'You want maximum value'],
	avoid: ['0/1 knapsack (no fractions)', 'You must pick whole items only'],
	time: { avg: 'O(n log n)', worst: 'O(n log n)' },
	space: 'O(1)'
};

export const java = `import java.util.*;

public class FractionalKnapsack {
    static class Item {
        String name;
        int weight;
        int value;
        double ratio;

        Item(String name, int weight, int value) {
            this.name = name;
            this.weight = weight;
            this.value = value;
            this.ratio = (double) value / weight;
        }
    }

    public static double solve(Item[] items, int capacity) {
        Arrays.sort(items, (a, b) -> Double.compare(b.ratio, a.ratio));

        double totalValue = 0.0;
        int remaining = capacity;

        for (Item item : items) {
            if (remaining <= 0) break;

            if (item.weight <= remaining) {
                totalValue += item.value;
                remaining -= item.weight;
            } else {
                double fraction = (double) remaining / item.weight;
                totalValue += item.value * fraction;
                remaining = 0;
            }
        }

        return totalValue;
    }

    public static void main(String[] args) {
        Item[] items = {
            new Item("A", 10, 60),
            new Item("B", 20, 100),
            new Item("C", 30, 120)
        };

        System.out.println(solve(items, 50));
    }
}`;
