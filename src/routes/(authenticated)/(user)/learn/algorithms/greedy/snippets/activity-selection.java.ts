export const meta = {
	title: 'Activity Selection',
	what: 'You have activities with a start time and an end time, and you want to attend as many as possible without overlaps. Sort activities by end time, then scan from earliest finish to latest. Keep an activity if its start time is at least the end time of the last one you kept. This greedy choice works because finishing earlier leaves the most room for future activities.',
	when: [
		'You want the maximum number of non-overlapping intervals',
		'Activities do not have values/weights (count is what matters)',
		'Scheduling problems where each activity blocks its whole interval'
	],
	avoid: [
		'Activities have profits/weights and you must maximize total profit (use weighted interval scheduling DP)'
	],
	time: { avg: 'O(n^2) (simple sort) / O(n log n) (with fast sort)', worst: 'O(n^2)' },
	space: 'O(n)'
};

export const java = `public class ActivitySelection {
    public static int[] selectByEndTime(int[] id, int[] start, int[] end) {
        int n = end.length;
        if (n == 0) return new int[0];

        int[] ids = new int[n];
        int[] s = new int[n];
        int[] e = new int[n];

        for (int i = 0; i < n; i++) {
            ids[i] = id[i];
            s[i] = start[i];
            e[i] = end[i];
        }

        for (int i = 1; i < n; i++) {
            int tid = ids[i];
            int ts = s[i];
            int te = e[i];
            int j = i - 1;

            while (j >= 0 && e[j] > te) {
                ids[j + 1] = ids[j];
                s[j + 1] = s[j];
                e[j + 1] = e[j];
                j--;
            }

            ids[j + 1] = tid;
            s[j + 1] = ts;
            e[j + 1] = te;
        }

        int[] out = new int[n];
        int outSize = 0;

        int lastEnd = -2147483648;

        for (int i = 0; i < n; i++) {
            if (s[i] >= lastEnd) {
                out[outSize] = ids[i];
                outSize++;
                lastEnd = e[i];
            }
        }

        int[] res = new int[outSize];
        for (int i = 0; i < outSize; i++) res[i] = out[i];
        return res;
    }
}
`;
