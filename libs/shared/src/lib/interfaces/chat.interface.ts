export interface ChatCourseContext {
  courseid: string;
  coursename: string;
}

export interface ChatContact {
  userid: string;
  fullname: string;
  profilepic: string;
  role: "student" | "tutor";
  courses: ChatCourseContext[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  studentId: string;
  instructorId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt: string | null;
}

export interface ChatConversationSummary {
  pairKey: string;
  participantId: string;
  conversationId: string | null;
  latestMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatEligiblePair {
  studentId: string;
  instructorId: string;
  courseIds: string[];
}

export interface ChatSocketAck<T = undefined> {
  success: boolean;
  payload?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ChatConversationOpenPayload {
  participantId: string;
}

export interface ChatHistoryPayload extends ChatConversationOpenPayload {
  before?: string;
  limit?: number;
}

export interface ChatSendPayload extends ChatConversationOpenPayload {
  clientMessageId: string;
  text: string;
}

export interface ChatSocketEvents {
  "chat:conversations:list": {
    conversations: Array<
      ChatConversationSummary & { contact: ChatContact; online: boolean }
    >;
  };
  "chat:conversation:open": {
    conversationId: string;
    contact: ChatContact;
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor: string | null;
  };
  "chat:messages:history": {
    conversationId: string;
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor: string | null;
  };
  "chat:message:send": {
    message: ChatMessage;
    unreadCount: number;
  };
  "chat:messages:read": {
    conversationId: string;
    unreadCount: number;
  };
  "chat:typing:start": ChatConversationOpenPayload;
  "chat:typing:stop": ChatConversationOpenPayload;
  "chat:message:new": ChatMessage;
  "chat:conversation:updated": {
    pairKey: string;
    participantId: string;
    latestMessage: string;
    lastMessageAt: string;
    unreadCount: number;
  };
  "chat:typing": {
    participantId: string;
    typing: boolean;
  };
  "chat:conversation:read": {
    conversationId: string;
    unreadCount: number;
  };
  "chat:presence": {
    participantId: string;
    online: boolean;
  };
  "chat:session:invalid": undefined;
  "chat:error": {
    code: string;
    message: string;
  };
}

export interface ChatClientToServerEvents {
  "chat:conversations:list": (
    payload: null,
    acknowledge: (response: ChatSocketAck<{
      conversations: Array<
        ChatConversationSummary & { contact: ChatContact; online: boolean }
      >;
    }>) => void,
  ) => void;
  "chat:conversation:open": (
    payload: ChatConversationOpenPayload,
    acknowledge: (response: ChatSocketAck<{
      conversationId: string;
      contact: ChatContact;
      messages: ChatMessage[];
      hasMore: boolean;
      nextCursor: string | null;
    }>) => void,
  ) => void;
  "chat:messages:history": (
    payload: ChatHistoryPayload,
    acknowledge: (response: ChatSocketAck<{
      conversationId: string;
      messages: ChatMessage[];
      hasMore: boolean;
      nextCursor: string | null;
    }>) => void,
  ) => void;
  "chat:message:send": (
    payload: ChatSendPayload,
    acknowledge: (response: ChatSocketAck<{
      message: ChatMessage;
      unreadCount: number;
    }>) => void,
  ) => void;
  "chat:messages:read": (
    payload: ChatConversationOpenPayload,
    acknowledge: (response: ChatSocketAck<{
      conversationId: string;
      unreadCount: number;
    }>) => void,
  ) => void;
  "chat:typing:start": (
    payload: ChatConversationOpenPayload,
    acknowledge: (response: ChatSocketAck<{ sent: boolean }>) => void,
  ) => void;
  "chat:typing:stop": (
    payload: ChatConversationOpenPayload,
    acknowledge: (response: ChatSocketAck<{ sent: boolean }>) => void,
  ) => void;
}

export type ChatServerToClientEvents = {
  [Event in keyof ChatSocketEvents]: ChatSocketEvents[Event] extends undefined
    ? () => void
    : (payload: ChatSocketEvents[Event]) => void;
};

export interface IGetConversation {
  sender: string;
  receiver: string;
}

export interface ISendMessage {
  message: string;
  sender: { userid: string; username: string };
  receiver: { userid: string; username: string };
}
