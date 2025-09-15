import type { TestCase } from "../../Types/Problem";

export interface EditorBottomPanelArg{
    isTerminalShown: boolean;
    isTestCasesShown: boolean;
    testCases: TestCase[];
    terminalContents: string;
}