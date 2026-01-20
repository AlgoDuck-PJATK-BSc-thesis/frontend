export const meta = {
	title: 'Job Sequencing with Deadlines',
	what: 'Each job takes exactly 1 time unit, so the schedule is a row of slots: t1, t2, t3, ... Only one job can go in each slot. A job with deadline d must be placed in one of the slots t1..td. The greedy idea: sort jobs by profit (highest first), then for each job try to place it as late as possible before its deadline. In the animation, “t2: J1” means Job 1 is scheduled in slot 2.',
	when: [
		'Each job duration is 1',
		'You can do at most one job per time slot',
		'You want to maximize total profit'
	],
	avoid: [
		'Jobs take different amounts of time',
		'You can preempt/split jobs',
		'You need to maximize count only (then activity selection fits better)'
	],
	time: { avg: 'O(n^2)', worst: 'O(n^2)' },
	space: 'O(n)',
	flags: { output: 'slots[t] = jobId at time slot t+1' }
};

export const java = `public class JobSequencing {
    public static final class Result {
        public final int[] slots;
        public final int jobsDone;
        public final int totalProfit;

        public Result(int[] slots, int jobsDone, int totalProfit) {
            this.slots = slots;
            this.jobsDone = jobsDone;
            this.totalProfit = totalProfit;
        }
    }

    public static Result schedule(int[] id, int[] deadline, int[] profit) {
        int n = id.length;
        if (n == 0) return new Result(new int[0], 0, 0);

        int[] ids = new int[n];
        int[] d = new int[n];
        int[] p = new int[n];

        for (int i = 0; i < n; i++) {
            ids[i] = id[i];
            d[i] = deadline[i];
            p[i] = profit[i];
        }

        for (int i = 1; i < n; i++) {
            int tid = ids[i];
            int td = d[i];
            int tp = p[i];
            int j = i - 1;

            while (j >= 0 && p[j] < tp) {
                ids[j + 1] = ids[j];
                d[j + 1] = d[j];
                p[j + 1] = p[j];
                j--;
            }

            ids[j + 1] = tid;
            d[j + 1] = td;
            p[j + 1] = tp;
        }

        int maxD = 0;
        for (int i = 0; i < n; i++) if (d[i] > maxD) maxD = d[i];
        if (maxD <= 0) return new Result(new int[0], 0, 0);

        int[] slots = new int[maxD];
        for (int i = 0; i < maxD; i++) slots[i] = 0;

        int jobsDone = 0;
        int totalProfit = 0;

        for (int i = 0; i < n; i++) {
            int dl = d[i];
            if (dl <= 0) continue;
            if (dl > maxD) dl = maxD;

            for (int t = dl - 1; t >= 0; t--) {
                if (slots[t] == 0) {
                    slots[t] = ids[i];
                    jobsDone++;
                    totalProfit += p[i];
                    break;
                }
            }
        }

        return new Result(slots, jobsDone, totalProfit);
    }
}
`;
