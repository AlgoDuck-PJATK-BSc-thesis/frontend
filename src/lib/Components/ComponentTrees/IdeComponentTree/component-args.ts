import type { StandardResponseDto } from "$lib/api/apiCall";
import type { AssistantQuery, AssistantResponse, ChatMessage } from "$lib/types/domain/modules/problem/assistant";
import type { IntermediateStatus, TerminalStatus } from "$lib/types/domain/modules/problem/solve";
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


export interface TipTapWithMdArgs extends DefaultLayoutTerminalComponentArgs {
    editorContents: string
}

export interface TerminalComponentArgs extends DefaultLayoutTerminalComponentArgs {
    stdOut: string
    stdErr: string
    status: IntermediateStatus | TerminalStatus | undefined
}

export interface CodeEditorComponentArgs extends DefaultLayoutTerminalComponentArgs {
  templateContents: string,
  userCode?: string,
  problemId: string,
  isDetachedHeadMode: boolean,
  upstreamChanged?: boolean
}

export interface TestCaseComponentArgs extends DefaultLayoutTerminalComponentArgs {
  isFileTreeOpen: boolean,
  testCases: TestCase[],
  InsertTestCase: (testCaseId: string) => Promise<void>
}


export interface ChatWindowComponentArgs extends DefaultLayoutTerminalComponentArgs {
  chatName?: string,
  chatId: string,
  pages: CustomPageData<ChatMessage>[],
  problemId: string,
  isConnected?: boolean,
  getUserCode: () => string,
  changeLabel: (id: string, newLabel: string) => void
}

export interface AssistantComponentArgs extends DefaultLayoutTerminalComponentArgs {
  conversations: Record<string, CustomPageData<AssistantConversationMessage>[]>
}

export interface AssistantConversationMessage {
  messageContents: string,
  originator: AssistantMessageOriginator;
}

export type AssistantMessageOriginator = "User" | "Assistant"