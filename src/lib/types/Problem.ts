import type { ComponentType } from "../../routes/editor/ResizableComponentArg";

export interface IdeComponentArgs{
  ideComponents: Map<ComponentType, { options: any}>
}
export interface Problem {
  problemId: string;
  title: string;
  description: string;
  category: {
    name: string;
  };
  difficulty: {
    name: 'EASY' | 'MEDIUM' | 'HARD';
  };
  type: {
    name: string;
  };
  templateContents: string;
  tags: string[];
  testCases: TestCase[];
}

export interface TestCase {
  testCaseId: string,
  display: string;
  displayRes: string;
  isPublic: boolean;
  isPassed: boolean | null,
}