export const meta = {
	title: 'Activity Selection',
	what: 'Select the maximum number of non-overlapping activities by always choosing the next activity that finishes earliest.',
	when: [
		'You need the maximum count of compatible intervals',
		'You can sort by finish time',
		'Classic scheduling problems'
	],
	avoid: [
		'You need maximum total value (weighted intervals)',
		'Intervals have weights and you must optimize weight sum'
	],
	time: { avg: 'O(n log n)', worst: 'O(n log n)' },
	space: 'O(1)'
};

export const java = `import java.util.*;

public class ActivitySelection {
    static class Activity {
        int start;
        int end;

        Activity(int start, int end) {
            this.start = start;
            this.end = end;
        }
    }

    public static List<Activity> selectActivities(Activity[] activities) {
        Arrays.sort(activities, (a, b) -> a.end - b.end);

        List<Activity> selected = new ArrayList<>();
        selected.add(activities[0]);

        int lastEnd = activities[0].end;

        for (int i = 1; i < activities.length; i++) {
            if (activities[i].start >= lastEnd) {
                selected.add(activities[i]);
                lastEnd = activities[i].end;
            }
        }

        return selected;
    }

    public static void main(String[] args) {
        Activity[] activities = {
            new Activity(1, 3),
            new Activity(2, 5),
            new Activity(4, 7),
            new Activity(1, 8),
            new Activity(5, 9),
            new Activity(8, 10)
        };

        List<Activity> selected = selectActivities(activities);

        for (Activity a : selected) {
            System.out.println(a.start + " " + a.end);
        }
    }
}`;
