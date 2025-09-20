import type { CategoryDto } from "./CategoryDto";
import type { Problem, TestCase } from "./Problem";

export interface TerminalComponentArgs{
    terminalContents: string;
}

export interface TestCaseComponentArgs{
    testCases: TestCase[];
}

export interface InfoPanelComponentArgs{
    problem: Problem;
}

export interface CategoriesPageLoad {
  LoadedCategories: Array<CategoryDto>,
}

export interface CodeEditorArg{
    editorContents: string,
    fontSize?: number
}

export interface NonProblemButtonArgType{
    action: string,
    command: string,
    description: string,
    onClick: () => void,
}

import type { ProblemShowcase } from "./ProblemShowcase";

export interface ProblemButtonArgType{
    action: string,
    command: string,
    description: string,
    problem: ProblemShowcase,
}