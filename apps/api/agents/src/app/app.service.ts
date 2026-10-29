import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HumanMessage } from "@langchain/core/messages";
import { AiChatMessage, AiConversationSummary, success } from "@lms/shared";
import { Model, Types } from "mongoose";
import { getGraph } from "./agent/graph/graph";
import {
  AiConversation,
  AiConversationDocument,
} from "./schema/ai-conversation.schema";
import { AiMessage, AiMessageDocument } from "./schema/ai-message.schema";

@Injectable()
export class AppService {
  constructor(
    @InjectModel(AiConversation.name)
    private readonly conversationModel: Model<AiConversationDocument>,
    @InjectModel(AiMessage.name)
    private readonly messageModel: Model<AiMessageDocument>,
  ) {}

  async listConversations(data: { userId: string }) {
    const conversations = await this.conversationModel
      .find({ userId: data.userId })
      .sort({ updatedAt: -1 })
      .lean();
    return success(
      "AI conversations found.",
      conversations.map((conversation) => this.toSummary(conversation)),
    );
  }

  async createConversation(data: { userId: string }) {
    const conversation = await this.conversationModel.create({
      userId: data.userId,
      title: "New conversation",
    });
    return success("AI conversation created.", this.toSummary(conversation));
  }

  async getMessages(data: {
    userId: string;
    conversationId: string;
    before?: string;
    limit?: number;
  }) {
    const conversation = await this.requireConversation(
      data.userId,
      data.conversationId,
    );
    const limit = Math.min(Math.max(data.limit ?? 40, 1), 100);
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
      .map((message) => this.toMessage(message));
    return success("AI messages found.", {
      conversation: this.toSummary(conversation),
      messages,
      hasMore,
      nextCursor: hasMore ? messages[0]?.id ?? null : null,
    });
  }

  async chat(data: { userId: string; conversationId?: string; text: string }) {
    const text = data.text?.trim();
    if (!text || text.length > 8000) {
      throw new BadRequestException(
        "Messages must contain between 1 and 8000 characters.",
      );
    }
    const conversation = data.conversationId
      ? await this.requireConversation(data.userId, data.conversationId)
      : await this.conversationModel.create({
          userId: data.userId,
          title: this.titleFrom(text),
        });

    const userMessage = await this.messageModel.create({
      conversationId: conversation._id,
      role: "user",
      text,
    });

    let assistantText: string;
    try {
      const graph = await getGraph();
      const result = await graph.invoke(
        {
          prompt: text,
          messages: [new HumanMessage(text)],
        },
        {
          configurable: {
            thread_id: `ai:${data.userId}:${String(conversation._id)}`,
          },
        },
      );
      assistantText = this.responseText(result?.response);
    } catch (error) {
      console.error("AI invocation failed:", error);
      assistantText =
        "The learning assistant could not complete that request. Please try again in a moment.";
    }

    const assistantMessage = await this.messageModel.create({
      conversationId: conversation._id,
      role: "assistant",
      text: assistantText,
    });

    if (conversation.title === "New conversation") {
      conversation.title = this.titleFrom(text);
    }
    conversation.lastMessagePreview = assistantText.slice(0, 240);
    conversation.lastMessageAt = assistantMessage.createdAt;
    await conversation.save();

    return success("AI reply generated.", {
      conversation: this.toSummary(conversation),
      userMessage: this.toMessage(userMessage),
      assistantMessage: this.toMessage(assistantMessage),
    });
  }

  private async requireConversation(userId: string, conversationId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException("Invalid conversation id.");
    }
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      userId,
    });
    if (!conversation) {
      throw new NotFoundException("AI conversation not found.");
    }
    return conversation;
  }

  private titleFrom(text: string) {
    const compact = text.replace(/\s+/g, " ").trim();
    return compact.length > 72 ? `${compact.slice(0, 69)}...` : compact || "New conversation";
  }

  private responseText(value: unknown) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value)) {
      return value
        .map((part) =>
          typeof part === "string"
            ? part
            : part && typeof part === "object" && "text" in part
              ? String(part.text)
              : "",
        )
        .join("")
        .trim();
    }
    return "I could not generate a response. Please try again.";
  }

  private toSummary(conversation: {
    _id: unknown;
    title: string;
    lastMessagePreview: string;
    lastMessageAt: Date | null;
    updatedAt?: Date;
  }): AiConversationSummary {
    return {
      id: String(conversation._id),
      title: conversation.title,
      latestMessage: conversation.lastMessagePreview,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      updatedAt: conversation.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private toMessage(message: {
    _id: unknown;
    conversationId: unknown;
    role: "user" | "assistant";
    text: string;
    createdAt?: Date;
  }): AiChatMessage {
    return {
      id: String(message._id),
      conversationId: String(message.conversationId),
      role: message.role,
      text: message.text,
      createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
