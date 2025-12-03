import type { CategoryDto, DifficultyDto, TagDto, TestCase } from "./IdeComponentArgs";

export interface DefaultLayoutTerminalComponentArgs {}

export interface InfoPanelComponentArgs extends DefaultLayoutTerminalComponentArgs {
  problemId: string,
  title: string,
  description: string,
  category: CategoryDto,
  difficulty: DifficultyDto,
  templateContents: string,
  testCases: TestCase[],
  tags: TagDto[]
}

export interface TerminalComponentArgs extends DefaultLayoutTerminalComponentArgs{
    terminalContents: string
}

export interface CodeEditorComponentArgs extends DefaultLayoutTerminalComponentArgs{
  templateContents: string,
}

export interface TestCaseComponentArgs extends DefaultLayoutTerminalComponentArgs{
  testCases: TestCase[],
  InsertTestCase: (testCaseId: string) => Promise<void>
}