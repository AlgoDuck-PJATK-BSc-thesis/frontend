export const intermediateStatuses = ["Queued", "Compiling", "Executing"] as const;
export const terminalStatuses = ["Completed", "CompilationFailure", "RuntimeError", "ServiceFailure", "Timeout"] as const;

export type IntermediateStatus = (typeof intermediateStatuses)[number];
export type TerminalStatus = (typeof terminalStatuses)[number];


export const isIntermediateStatus = (status: IntermediateStatus | TerminalStatus | undefined): boolean => {
    if (!status) return false;
    return (intermediateStatuses as readonly string[]).includes(status);
}

export const isTerminalStatus = (status: IntermediateStatus | TerminalStatus | undefined): boolean => {
    if (!status) return false;
    return (terminalStatuses as readonly string[]).includes(status);
}

export type SubmissionResult = {
    stdOutput: string, 
    stdErr: string,
    executionTime: number,
    testResults: TestResult[]
    status: IntermediateStatus | TerminalStatus
}

export type TestResult = {
    testId: string, 
    isTestPassed: boolean
}
