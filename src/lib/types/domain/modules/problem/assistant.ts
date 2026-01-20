export type AssistantResponse = {
    assistantResponseB64: string
}

export type AssistantQuery = {
    exerciseId: string,
    codeB64: string,
    query: string,
    chatName?: string,
}

export type ChatList = {
  chats: ChatDetails[]
}

export type ChatDetails = {
  chatName: string,
  chatId: string,
}

export type ChatMessage = {
    fragments: MessageFragment[],
    messageAuthor: MessageAuthor,
    createdOn: Date
}

export type MessageFragment = {
    content: string,
    type: FragmentType
}

export type FragmentType = "Code" | "Text" | 1 | 0;

export type MessageAuthor = "User" | "Assistant";