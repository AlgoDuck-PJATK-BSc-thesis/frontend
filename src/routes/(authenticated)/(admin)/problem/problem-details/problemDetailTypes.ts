export type AttemptMetrics = {
    acceptanceRate: number;
    acceptedAttempts: number;
    acceptedUniqueAttempts: number;
    totalAttempts: number;
    uniqueAttempts: number;
}

export type CategoryDto = {
    name: string;
    id: string;
}

export type DifficultyDto = {
    id: string;
    name: string;
    rewardScaler: number;
}

export type ProblemDetailsCore = {
    category: CategoryDto;
    createdAt: string;
    createdBy: string;
    difficulty: DifficultyDto;
    lastUpdatedAt?: string;
    problemId: string;
    problemName: string;
}

export type BucketData = {
    range: string;
    count: number;
}

export type PerformanceMetrics = {
    averageRuntimeNs: number;
    medianRuntimeMs: number;
    p95RuntimeMs: number;
    avgJvmMemoryUsageKb: number;
    memoryBuckets: BucketData[];
    runtimeBuckets: BucketData[];
}

export type ChurnMetrics = {
    userStartCount: number;
    userFinishCount: number;
    userSubmitCount: number;
}

export type RecentSubmissionDto = {
    userId: string;
    username: string;
    runtimeNs: number;
    status: string;
    submittedAt: string;
    submissionId: string;
}

export type TestCaseStats = {
    testCaseId: string;
    isPublic: boolean;
    passRate: number;
}

export type AcceptanceRatePoint = {
    date: string;
    rate: number;
}

export type SubmissionPoint = {
    date: string;
    count: number;
    passed: number;
}

export type TimeSeriesMetrics = {
    acceptanceRateHistory: AcceptanceRatePoint[];
    submissionsOverTime: SubmissionPoint[];
}

export type ProblemStatsDto = {
    attemptMetrics: AttemptMetrics;
    problemDetailsCore: ProblemDetailsCore;
    performanceMetrics: PerformanceMetrics;
    churnMetrics: ChurnMetrics;
    recentSubmission: RecentSubmissionDto[];
    testCaseStats: TestCaseStats[];
    timeSeriesMetrics: TimeSeriesMetrics;
}

export const PerformanceTabs: string[] = [ "Memory", "Runtime" ] as const
export type PerformanceTab = (typeof PerformanceTabs)[number];

