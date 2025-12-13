export type SubmissionStatus = "Queuing" | "Compiling" | "Executing" | "Completed";

export type SubmissionResult = {
    stdOutput: string, 
    stdErr: string,
    executionTime: number,
    testResults: TestResult[]
    status: SubmissionStatus
}


export type TestResult = {
    testId: string, 
    isTestPassed: boolean
}


