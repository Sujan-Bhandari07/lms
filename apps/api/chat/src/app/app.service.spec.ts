import { describe, expect, it, vi, beforeEach } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { AppService } from "./app.service";
import { Types } from "mongoose";

describe("Chat AppService", () => {
  let mockMessageModel: any;
  let mockConversationModel: any;
  let service: AppService;

  beforeEach(() => {
    mockMessageModel = {
      create: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      updateMany: vi.fn(),
    };
    mockConversationModel = {
      findOneAndUpdate: vi.fn(),
      findOne: vi.fn(),
      findById: vi.fn(),
      updateOne: vi.fn(),
    };
    service = new AppService(mockMessageModel, mockConversationModel);
  });

  it("should enforce participants in openConversation", async () => {
    await expect(
      service.openConversation({
        userId: "hacker999",
        studentId: "student1",
        instructorId: "tutor1",
        courseIds: ["course1"],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("should open and create a conversation with pairKey", async () => {
    const fakeConversation = {
      _id: new Types.ObjectId(),
      studentId: "student1",
      instructorId: "tutor1",
      courseIds: ["course1"],
    };
    mockConversationModel.findOneAndUpdate.mockResolvedValue(fakeConversation);

    const result = await service.openConversation({
      userId: "student1",
      studentId: "student1",
      instructorId: "tutor1",
      courseIds: ["course1"],
    });

    expect(result.studentId).toBe("student1");
    expect(result.instructorId).toBe("tutor1");
    expect(mockConversationModel.findOneAndUpdate).toHaveBeenCalledWith(
      { pairKey: "student1:tutor1" },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          pairKey: "student1:tutor1",
          participants: ["student1", "tutor1"],
        }),
        $addToSet: { courseIds: { $each: ["course1"] } },
      }),
      expect.any(Object),
    );
  });

  it("should send a message and increment the receiver unread count", async () => {
    const convId = new Types.ObjectId();
    const fakeConversation = {
      _id: convId,
      studentId: "student1",
      instructorId: "tutor1",
      studentUnreadCount: 0,
      instructorUnreadCount: 1,
    };
    mockConversationModel.findOneAndUpdate.mockResolvedValue(fakeConversation);
    mockConversationModel.findById.mockResolvedValue(fakeConversation);
    mockConversationModel.updateOne.mockResolvedValue({ acknowledged: true });

    const msgId = new Types.ObjectId();
    const now = new Date();
    mockMessageModel.create.mockResolvedValue({
      _id: msgId,
      conversationId: convId,
      senderId: "student1",
      clientMessageId: "12345678-1234-1234-1234-123456789abc",
      text: "Hello Tutor!",
      createdAt: now,
      readAt: null,
    });

    const result = await service.sendMessage({
      senderId: "student1",
      studentId: "student1",
      instructorId: "tutor1",
      courseIds: ["course1"],
      clientMessageId: "12345678-1234-1234-1234-123456789abc",
      text: "Hello Tutor!",
    });

    expect(result.message.text).toBe("Hello Tutor!");
    expect(result.duplicate).toBe(false);
    expect(result.instructorUnreadCount).toBe(1);
    expect(mockConversationModel.updateOne).toHaveBeenCalledWith(
      { _id: convId },
      expect.objectContaining({
        $inc: { instructorUnreadCount: 1 },
      }),
    );
  });

  it("should mark messages as read and reset unread count", async () => {
    const convId = new Types.ObjectId();
    const fakeConversation = {
      _id: convId,
      studentId: "student1",
      instructorId: "tutor1",
      studentUnreadCount: 0,
      instructorUnreadCount: 0,
    };
    mockConversationModel.findOne.mockResolvedValue(fakeConversation);
    mockConversationModel.findById.mockResolvedValue(fakeConversation);
    mockConversationModel.updateOne.mockResolvedValue({ acknowledged: true });
    mockMessageModel.updateMany.mockResolvedValue({ acknowledged: true });

    const result = await service.markRead({
      userId: "tutor1",
      studentId: "student1",
      instructorId: "tutor1",
      courseIds: ["course1"],
    });

    expect(result.unreadCount).toBe(0);
    expect(mockMessageModel.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: convId,
        senderId: { $ne: "tutor1" },
        readAt: null,
      }),
      expect.any(Object),
    );
    expect(mockConversationModel.updateOne).toHaveBeenCalledWith(
      { _id: convId },
      { $set: { instructorUnreadCount: 0 } },
    );
  });
});

