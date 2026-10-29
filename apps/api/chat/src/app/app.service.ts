import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ChatEligiblePair, ChatMessage } from "@lms/shared";
import { Model, Types } from "mongoose";
import {
  Conversation,
  ConversationDocument,
} from "./schema/conversation.schema";
import { Message, MessageDocument } from "./schema/message.schema";

interface PairRequest {
  studentId: string;
  instructorId: string;
  courseIds: string[];
}

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async listConversations(data: {
    userId: string;
    pairs: ChatEligiblePair[];
  }) {
    if (!data.pairs.length) return [];
    const pairKeys = data.pairs.map((pair) =>
      this.pairKey(pair.studentId, pair.instructorId),
    );
    const conversations = await this.conversationModel
      .find({ pairKey: { $in: pairKeys }, participants: data.userId })
      .lean();
    const conversationByKey = new Map(
      conversations.map((conversation) => [conversation.pairKey, conversation]),
    );

    return data.pairs.map((pair) => {
      const pairKey = this.pairKey(pair.studentId, pair.instructorId);
      const conversation = conversationByKey.get(pairKey);
      const isStudent = data.userId === pair.studentId;
      return {
        pairKey,
        participantId: isStudent ? pair.instructorId : pair.studentId,
        conversationId: conversation ? String(conversation._id) : null,
        latestMessage: conversation?.lastMessagePreview ?? "",
        lastMessageAt: conversation?.lastMessageAt?.toISOString() ?? null,
        unreadCount: conversation
          ? isStudent
            ? conversation.studentUnreadCount
            : conversation.instructorUnreadCount
          : 0,
      };
    });
  }

  async openConversation(data: PairRequest & { userId: string }) {
    this.assertParticipant(data, data.userId);
    const pairKey = this.pairKey(data.studentId, data.instructorId);
    let conversation: ConversationDocument | null;
    try {
      conversation = await this.conversationModel.findOneAndUpdate(
        { pairKey },
        {
          $setOnInsert: {
            pairKey,
            studentId: data.studentId,
            instructorId: data.instructorId,
            participants: [data.studentId, data.instructorId],
          },
          $addToSet: { courseIds: { $each: data.courseIds } },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    } catch (error) {
      if (!this.isDuplicateKey(error)) throw error;
      conversation = await this.conversationModel.findOne({ pairKey });
    }
    if (!conversation) {
      throw new ConflictException("The conversation could not be opened.");
    }
    return {
      conversationId: String(conversation._id),
      studentId: conversation.studentId,
      instructorId: conversation.instructorId,
    };
  }

  async getMessages(
    data: PairRequest & {
      userId: string;
      before?: string;
      limit?: number;
    },
  ) {
    this.assertParticipant(data, data.userId);
    const conversation = await this.findConversation(
      data.studentId,
      data.instructorId,
    );
    const limit = Math.min(Math.max(data.limit ?? 30, 1), 100);
    const filter: Record<string, unknown> = {
      conversationId: conversation._id,
    };
    if (data.before) {
      if (!Types.ObjectId.isValid(data.before)) {
        throw new BadRequestException("Invalid message history cursor.");
      }
      const cursor = await this.messageModel
        .findOne({
          _id: new Types.ObjectId(data.before),
          conversationId: conversation._id,
        })
        .select("_id createdAt")
        .lean();
      if (!cursor) {
        throw new BadRequestException("Invalid message history cursor.");
      }
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { $lt: cursor._id } },
      ];
    }
    const rows = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = rows.length > limit;
    const messages = rows
      .slice(0, limit)
      .reverse()
      .map((message) => this.toChatMessage(message, conversation));
    return {
      conversationId: String(conversation._id),
      messages,
      hasMore,
      nextCursor: hasMore ? messages[0]?.id ?? null : null,
    };
  }

  async sendMessage(
    data: PairRequest & {
      senderId: string;
      clientMessageId: string;
      text: string;
    },
  ) {
    this.assertParticipant(data, data.senderId);
    const text = data.text.trim();
    if (!text || text.length > 4000) {
      throw new BadRequestException(
        "Messages must contain between 1 and 4000 characters.",
      );
    }
    if (!/^[\da-f-]{36}$/i.test(data.clientMessageId)) {
      throw new BadRequestException("Invalid message id.");
    }
    const conversation = await this.openConversation({
      ...data,
      userId: data.senderId,
    });
    const conversationDocument = await this.conversationModel.findById(
      conversation.conversationId,
    );
    if (!conversationDocument) {
      throw new NotFoundException("Conversation not found.");
    }

    let message: MessageDocument;
    let isNew = true;
    try {
      message = await this.messageModel.create({
        conversationId: conversationDocument._id,
        senderId: data.senderId,
        clientMessageId: data.clientMessageId,
        text,
      });
    } catch (error) {
      if (!this.isDuplicateKey(error)) throw error;
      const duplicate = await this.messageModel.findOne({
        senderId: data.senderId,
        clientMessageId: data.clientMessageId,
      });
      if (!duplicate) throw error;
      if (!duplicate.conversationId.equals(conversationDocument._id)) {
        throw new ConflictException(
          "This message id was already used in another conversation.",
        );
      }
      message = duplicate;
      isNew = false;
    }

    const unreadField =
      data.senderId === data.studentId
        ? "instructorUnreadCount"
        : "studentUnreadCount";
    if (isNew) {
      await this.conversationModel.updateOne(
        { _id: conversationDocument._id },
        {
          $inc: { [unreadField]: 1 },
          $set: { lastMessagePreview: text, lastMessageAt: message.createdAt },
        },
      );
    }
    const current = await this.conversationModel.findById(
      conversationDocument._id,
    );
    if (!current) throw new NotFoundException("Conversation not found.");
    return {
      message: this.toChatMessage(message, conversationDocument),
      studentUnreadCount: current.studentUnreadCount,
      instructorUnreadCount: current.instructorUnreadCount,
      duplicate: !isNew,
    };
  }

  async markRead(data: PairRequest & { userId: string }) {
    this.assertParticipant(data, data.userId);
    const conversation = await this.findConversation(
      data.studentId,
      data.instructorId,
    );
    const readAt = new Date();
    await this.messageModel.updateMany(
      {
        conversationId: conversation._id,
        senderId: { $ne: data.userId },
        readAt: null,
      },
      { $set: { readAt } },
    );
    const unreadField =
      data.userId === data.studentId
        ? "studentUnreadCount"
        : "instructorUnreadCount";
    await this.conversationModel.updateOne(
      { _id: conversation._id },
      { $set: { [unreadField]: 0 } },
    );
    const updated = await this.conversationModel.findById(conversation._id);
    if (!updated) throw new NotFoundException("Conversation not found.");
    return {
      conversationId: String(conversation._id),
      unreadCount: 0,
      studentUnreadCount: updated.studentUnreadCount,
      instructorUnreadCount: updated.instructorUnreadCount,
    };
  }

  private async findConversation(studentId: string, instructorId: string) {
    const conversation = await this.conversationModel.findOne({
      pairKey: this.pairKey(studentId, instructorId),
      participants: { $all: [studentId, instructorId] },
    });
    if (!conversation) throw new NotFoundException("Conversation not found.");
    return conversation;
  }

  private assertParticipant(pair: PairRequest, userId: string) {
    if (userId !== pair.studentId && userId !== pair.instructorId) {
      throw new BadRequestException("Invalid conversation participant.");
    }
  }

  private pairKey(studentId: string, instructorId: string) {
    return `${studentId}:${instructorId}`;
  }

  private toChatMessage(message: {
    _id: Types.ObjectId;
    conversationId: Types.ObjectId;
    senderId: string;
    text: string;
    createdAt?: Date;
    readAt: Date | null;
  }, conversation: Pick<Conversation, "studentId" | "instructorId">): ChatMessage {
    return {
      id: String(message._id),
      conversationId: String(message.conversationId),
      studentId: conversation.studentId,
      instructorId: conversation.instructorId,
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
      readAt: message.readAt?.toISOString() ?? null,
    };
  }

  private isDuplicateKey(error: unknown) {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    );
  }
}
