export const meta = {
	title: 'Job Sequencing with Deadlines',
	what: 'Schedule jobs (one per slot) to maximize profit by taking jobs in descending profit order and placing each as late as possible before its deadline.',
	when: [
		'Each job takes one unit time',
		'Profit per job is known',
		'You can schedule at most one job per slot'
	],
	avoid: [
		'Jobs have varying durations',
		'Preemption is allowed',
		'You need weighted intervals with duration'
	],
	time: { avg: 'O(n^2)', worst: 'O(n^2)' },
	space: 'O(n)'
};

export const java = `import java.util.*;

public class JobSequencing {
    static class Job {
        int id;
        int deadline;
        int profit;

        Job(int id, int deadline, int profit) {
            this.id = id;
            this.deadline = deadline;
            this.profit = profit;
        }
    }

    public static int[] solve(Job[] jobs) {
        Arrays.sort(jobs, (a, b) -> b.profit - a.profit);

        int maxDeadline = 0;
        for (Job job : jobs) {
            maxDeadline = Math.max(maxDeadline, job.deadline);
        }

        int[] slots = new int[maxDeadline];
        Arrays.fill(slots, -1);

        int totalProfit = 0;
        int jobsDone = 0;

        for (Job job : jobs) {
            for (int t = job.deadline - 1; t >= 0; t--) {
                if (slots[t] == -1) {
                    slots[t] = job.id;
                    totalProfit += job.profit;
                    jobsDone++;
                    break;
                }
            }
        }

        return new int[] { jobsDone, totalProfit };
    }

    public static void main(String[] args) {
        Job[] jobs = {
            new Job(1, 2, 100),
            new Job(2, 1, 19),
            new Job(3, 2, 27),
            new Job(4, 1, 25),
            new Job(5, 3, 15)
        };

        int[] res = solve(jobs);
        System.out.println(res[0]);
        System.out.println(res[1]);
    }
}`;
