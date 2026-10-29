export interface AiChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

export interface AiConversationSummary {
  id: string;
  title: string;
  latestMessage: string;
  lastMessageAt: string | null;
  updatedAt: string;
}

export interface AiChatRequest {
  userId: string;
  conversationId?: string;
  text: string;
}

export interface AiChatResult {
  conversation: AiConversationSummary;
  userMessage: AiChatMessage;
  assistantMessage: AiChatMessage;
}
