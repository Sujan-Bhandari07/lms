import { describe, expect, it, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { AppService } from "./app.service";
import { Types } from "mongoose";

describe("Agents AppService", () => {
  let mockConversationModel: any;
  let mockMessageModel: any;
  let service: AppService;

  beforeEach(() => {
    mockConversationModel = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    };
    mockMessageModel = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
    };
    service = new AppService(mockConversationModel, mockMessageModel);
  });

  it("should list only conversations belonging to the authenticated user", async () => {
    const user1Convs = [
      {
        _id: new Types.ObjectId(),
        userId: "user1",
        title: "NestJS question",
        lastMessagePreview: "NestJS guards run before interceptors",
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockConversationModel.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(user1Convs),
      }),
    });

    const result = await service.listConversations({ userId: "user1" });
    expect(result.success).toBe(true);
    expect(result.payload.length).toBe(1);
    expect(result.payload[0].title).toBe("NestJS question");
    expect(mockConversationModel.find).toHaveBeenCalledWith({ userId: "user1" });
  });

  it("should throw NotFoundException if conversation belongs to another user", async () => {
    mockConversationModel.findOne.mockResolvedValue(null);

    const otherUserConvId = new Types.ObjectId().toString();
    await expect(
      service.getMessages({
        userId: "user1",
        conversationId: otherUserConvId,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("should retrieve messages for valid conversation", async () => {
    const convId = new Types.ObjectId();
    const fakeConv = {
      _id: convId,
      userId: "user1",
      title: "My AI Chat",
      lastMessagePreview: "[Watch lesson](https://media.example.com/videos/lesson.mp4)",
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    };

    mockConversationModel.findOne.mockResolvedValue(fakeConv);

    const fakeMessages = [
      {
        _id: new Types.ObjectId(),
        conversationId: convId,
        role: "user",
        text: "What is NestJS?",
        createdAt: new Date(),
      },
      {
        _id: new Types.ObjectId(),
        conversationId: convId,
        role: "assistant",
        text: "Watch [lesson](https://media.example.com/videos/lesson.mp4)",
        createdAt: new Date(),
      },
    ];

    mockMessageModel.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(fakeMessages),
        }),
      }),
    });

    const result = await service.getMessages({
      userId: "user1",
      conversationId: convId.toString(),
    });

    expect(result.success).toBe(true);
    expect(result.payload.messages.length).toBe(2);
    expect(result.payload.messages[0].role).toBe("assistant");
    expect(result.payload.messages[1].role).toBe("user");
    expect(result.payload.messages[0].text).not.toContain("lesson.mp4");
    expect(result.payload.conversation.latestMessage).not.toContain("lesson.mp4");
  });
});
