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
  testCases: TestCase[];
  tags: string[];
}

export interface TestCase {
  testCaseId: string,
  display: string;
  displayRes: string;
  isPublic: boolean;
  isPassed: boolean | null,
}