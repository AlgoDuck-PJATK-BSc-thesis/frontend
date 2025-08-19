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
}

interface TestCase {
  testInput: string;
  expectedOutput: string;
  call: string;
  funcName: string;
  display: string;
  displayRes: string;
  isPublic: boolean;
}