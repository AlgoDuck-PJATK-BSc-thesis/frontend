import type { StandardResponseDto } from "$lib/api/apiCall";
import type { AssistantQuery, AssistantResponse } from "$lib/types/domain/modules/problem/assistant";
import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
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

export interface TerminalComponentArgs extends DefaultLayoutTerminalComponentArgs {
    terminalContents: string
}

export interface CodeEditorComponentArgs extends DefaultLayoutTerminalComponentArgs {
  templateContents: string,
  problemId: string
}

export interface TestCaseComponentArgs extends DefaultLayoutTerminalComponentArgs {
  testCases: TestCase[],
  InsertTestCase: (testCaseId: string) => Promise<void>
}


export interface ChatWindowComponentArgs extends DefaultLayoutTerminalComponentArgs {
  chatName: string,
  pages: CustomPageData<AssistantConversationMessage>[],
  getFullAssistanceData: (chatname: string, query: string) => AssistantQuery
}

export interface AssistantComponentArgs extends DefaultLayoutTerminalComponentArgs {
  conversations: Record<string, CustomPageData<AssistantConversationMessage>[]>
}

export interface AssistantConversationMessage {
  messageContents: string,
  originator: AssistantMessageOriginator;
}

export type AssistantMessageOriginator = "User" | "Assistant"