import { describe, expect, it, vi, beforeEach } from "vitest";
import { ChatController } from "./chat.controller";
import { of } from "rxjs";
import { AuthReq } from "@lms/shared";

describe("ChatController (HTTP REST)", () => {
  let mockChatClient: any;
  let mockAuthService: any;
  let mockChatGateway: any;
  let controller: ChatController;

  const mockReq: AuthReq = {
    user: "valid-session-token",
    cookies: { token: "valid-session-token" },
  } as any;

  beforeEach(() => {
    mockChatClient = {
      send: vi.fn(),
    };
    mockAuthService = {
      sessionProfile: vi.fn().mockResolvedValue({
        _id: "student1",
        fullname: "John Student",
        role: "student",
      }),
      getAuthorizedContacts: vi.fn().mockResolvedValue([
        {
          contact: {
            userid: "tutor1",
            fullname: "Jane Tutor",
            profilepic: "",
            role: "tutor",
            courses: [{ courseid: "course1", coursename: "NestJS Mastery" }],
          },
          pair: {
            studentId: "student1",
            instructorId: "tutor1",
            courseIds: ["course1"],
          },
        },
      ]),
      findAuthorizedContact: vi.fn().mockResolvedValue({
        contact: {
          userid: "tutor1",
          fullname: "Jane Tutor",
          profilepic: "",
          role: "tutor",
          courses: [{ courseid: "course1", coursename: "NestJS Mastery" }],
        },
        pair: {
          studentId: "student1",
          instructorId: "tutor1",
          courseIds: ["course1"],
        },
      }),
    };
    mockChatGateway = {
      isUserOnline: vi.fn().mockReturnValue(true),
      broadcastNewMessage: vi.fn(),
      broadcastReadUpdate: vi.fn(),
    };
    controller = new ChatController(
      mockChatClient,
      mockAuthService,
      mockChatGateway,
    );
  });

  it("should list authorized conversations via REST", async () => {
    mockChatClient.send.mockReturnValue(
      of([
        {
          pairKey: "student1:tutor1",
          participantId: "tutor1",
          conversationId: "conv123",
          latestMessage: "Hello!",
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        },
      ]),
    );

    const result = await controller.listConversations(mockReq);
    expect(result.success).toBe(true);
    expect(result.payload.conversations.length).toBe(1);
    expect(result.payload.conversations[0].contact.fullname).toBe("Jane Tutor");
    expect(result.payload.conversations[0].online).toBe(true);
  });

  it("should send a message via REST and broadcast to socket clients", async () => {
    const fakeMessage = {
      id: "msg1",
      conversationId: "conv123",
      studentId: "student1",
      instructorId: "tutor1",
      senderId: "student1",
      text: "How do I use guards?",
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    mockChatClient.send.mockReturnValue(
      of({
        message: fakeMessage,
        studentUnreadCount: 0,
        instructorUnreadCount: 1,
        duplicate: false,
      }),
    );

    const result = await controller.sendMessage(mockReq, "tutor1", {
      text: "How do I use guards?",
      clientMessageId: "12345678-1234-1234-1234-123456789abc",
    });

    expect(result.success).toBe(true);
    expect(result.payload.message.text).toBe("How do I use guards?");
    expect(mockChatGateway.broadcastNewMessage).toHaveBeenCalledWith(
      expect.anything(),
      fakeMessage,
      0,
      1,
    );
  });

  it("should retrieve paginated message history via REST", async () => {
    mockChatClient.send.mockReturnValue(
      of({
        conversationId: "conv123",
        messages: [],
        hasMore: false,
        nextCursor: null,
      }),
    );

    const result = await controller.getMessages(mockReq, "tutor1", {
      limit: 20,
    });
    expect(result.success).toBe(true);
    expect(result.payload.conversationId).toBe("conv123");
    expect(result.payload.contact.fullname).toBe("Jane Tutor");
  });

  it("should mark messages as read via REST and broadcast read status", async () => {
    mockChatClient.send.mockReturnValue(
      of({
        conversationId: "conv123",
        unreadCount: 0,
        studentUnreadCount: 0,
        instructorUnreadCount: 0,
      }),
    );

    const result = await controller.markRead(mockReq, "tutor1");
    expect(result.success).toBe(true);
    expect(mockChatGateway.broadcastReadUpdate).toHaveBeenCalled();
  });

  it("should calculate unread-count via REST", async () => {
    mockChatClient.send.mockReturnValue(
      of([
        { unreadCount: 3 },
      ]),
    );

    const result = await controller.getUnreadCount(mockReq);
    expect(result.success).toBe(true);
    expect(result.payload.unreadCount).toBe(3);
  });
});

