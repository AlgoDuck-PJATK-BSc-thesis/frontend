export type EntryType = 'deadline' | 'duration' | 'day';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type Weekday = DayOfWeek;

export type DayReminder = {
	day: DayOfWeek;
	enabled: boolean;
	hour: number;
	minute: number;
};

export type WeeklyReminderConfig = DayReminder[];
