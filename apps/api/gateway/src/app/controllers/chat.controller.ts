import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  AuthReq,
  ChatMessage,
  ChatParticipantDto,
  ChatHistoryQueryDto,
  ChatSendHttpDto,
  success,
} from "@lms/shared";
import { firstValueFrom, timeout } from "rxjs";
import { AuthGuard } from "../guards/auth.guard";
import { ChatAuthService } from "../services/chat-auth.service";
import { ChatGateway } from "../sockets/chat.gateway";

interface ChatServiceMessage {
  message: ChatMessage;
  studentUnreadCount: number;
  instructorUnreadCount: number;
  duplicate: boolean;
}

@Controller("chat")
@UseGuards(AuthGuard)
export class ChatController {
  constructor(
    @Inject("CHAT_SERVICE") private readonly chatClient: ClientProxy,
    private readonly authService: ChatAuthService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get("conversations")
  async listConversations(@Req() req: AuthReq) {
    const profile = await this.authService.sessionProfile(req.user);
    const authorized = await this.authService.getAuthorizedContacts(profile);
    const pairs = authorized.map(({ pair }) => pair);
    const summaries = pairs.length
      ? await firstValueFrom(
          this.chatClient
            .send<
              {
                pairKey: string;
                participantId: string;
                conversationId: string | null;
                latestMessage: string;
                lastMessageAt: string | null;
                unreadCount: number;
              }[]
            >("chat.listConversations", {
              userId: profile._id,
              pairs,
            })
            .pipe(timeout(10000)),
        )
      : [];
    const contactById = new Map(
      authorized.map(({ contact }) => [contact.userid, contact]),
    );
    const conversations = summaries
      .flatMap((summary) => {
        const contact = contactById.get(summary.participantId);
        if (!contact) return [];
        return [
          {
            ...summary,
            contact,
            online: this.chatGateway.isUserOnline(contact.userid),
          },
        ];
      })
      .sort(
        (left, right) =>
          new Date(right.lastMessageAt ?? 0).getTime() -
          new Date(left.lastMessageAt ?? 0).getTime(),
      );

    return success("Conversations found.", { conversations });
  }

  @Post("conversations")
  async openConversation(
    @Req() req: AuthReq,
    @Body() body: ChatParticipantDto,
  ) {
    const profile = await this.authService.sessionProfile(req.user);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      body.participantId,
    );
    const opened = await firstValueFrom(
      this.chatClient
        .send<{ conversationId: string }>("chat.openConversation", {
          userId: profile._id,
          ...authorized.pair,
        })
        .pipe(timeout(10000)),
    );
    return success("Conversation opened.", {
      conversationId: opened.conversationId,
      contact: authorized.contact,
    });
  }

  @Get("conversations/:participantId/messages")
  async getMessages(
    @Req() req: AuthReq,
    @Param("participantId") participantId: string,
    @Query() query: ChatHistoryQueryDto,
  ) {
    const profile = await this.authService.sessionProfile(req.user);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      participantId,
    );
    const history = await firstValueFrom(
      this.chatClient
        .send<{
          conversationId: string;
          messages: ChatMessage[];
          hasMore: boolean;
          nextCursor: string | null;
        }>("chat.getMessages", {
          userId: profile._id,
          ...authorized.pair,
          before: query.before,
          limit: query.limit,
        })
        .pipe(timeout(10000)),
    );
    return success("Messages found.", {
      ...history,
      contact: authorized.contact,
    });
  }

  @Post("conversations/:participantId/messages")
  async sendMessage(
    @Req() req: AuthReq,
    @Param("participantId") participantId: string,
    @Body() body: ChatSendHttpDto,
  ) {
    const profile = await this.authService.sessionProfile(req.user);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      participantId,
    );
    const text = body.text?.trim();
    if (!text || text.length > 4000) {
      throw new BadRequestException("Enter a message of 1 to 4000 characters.");
    }
    const clientMessageId = body.clientMessageId || crypto.randomUUID();
    const result = await firstValueFrom(
      this.chatClient
        .send<ChatServiceMessage>("chat.sendMessage", {
          ...authorized.pair,
          senderId: profile._id,
          clientMessageId,
          text,
        })
        .pipe(timeout(10000)),
    );
    if (!result.duplicate) {
      this.chatGateway.broadcastNewMessage(
        authorized,
        result.message,
        result.studentUnreadCount,
        result.instructorUnreadCount,
      );
    }
    return success("Message sent.", {
      message: result.message,
      unreadCount:
        profile._id === authorized.pair.studentId
          ? result.studentUnreadCount
          : result.instructorUnreadCount,
    });
  }

  @Post("conversations/:participantId/read")
  async markRead(
    @Req() req: AuthReq,
    @Param("participantId") participantId: string,
  ) {
    const profile = await this.authService.sessionProfile(req.user);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      participantId,
    );
    const result = await firstValueFrom(
      this.chatClient
        .send<{
          conversationId: string;
          unreadCount: number;
          studentUnreadCount: number;
          instructorUnreadCount: number;
        }>("chat.markRead", { userId: profile._id, ...authorized.pair })
        .pipe(timeout(10000)),
    );
    this.chatGateway.broadcastReadUpdate(authorized, result);
    return success("Messages marked as read.", result);
  }

  @Get("unread-count")
  async getUnreadCount(@Req() req: AuthReq) {
    const profile = await this.authService.sessionProfile(req.user);
    const authorized = await this.authService.getAuthorizedContacts(profile);
    const pairs = authorized.map(({ pair }) => pair);
    if (!pairs.length) {
      return success("Unread count found.", { unreadCount: 0 });
    }
    const summaries = await firstValueFrom(
      this.chatClient
        .send<{ unreadCount: number }[]>("chat.listConversations", {
          userId: profile._id,
          pairs,
        })
        .pipe(timeout(10000)),
    );
    const total = summaries.reduce(
      (sum, item) => sum + (item.unreadCount || 0),
      0,
    );
    return success("Unread count found.", { unreadCount: total });
  }
}

