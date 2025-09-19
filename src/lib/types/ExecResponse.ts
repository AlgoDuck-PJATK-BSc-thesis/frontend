export interface ExecResponse {
    stdOutput: string, 
    stdError: string,
    testResults: TestResult[],
    executionTime: number,
}

export interface TestResult{
    testId: string,
    isTestPassed: boolean,
}