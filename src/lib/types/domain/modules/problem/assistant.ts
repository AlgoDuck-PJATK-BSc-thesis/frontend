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
  chatName: string
}

export type ChatMessage = {
    message: string,
    author: MessageAuthor
}

export type MessageAuthor = "User" | "Assistant";