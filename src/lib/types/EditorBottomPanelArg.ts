import type { TestCase } from "./Problem";

export interface EditorBottomPanelArg{
    isTerminalShown: boolean;
    isTestCasesShown: boolean;
    testCases: TestCase[];
    terminalContents: string;
}