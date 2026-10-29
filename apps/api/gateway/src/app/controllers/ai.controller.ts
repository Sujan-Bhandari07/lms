import {
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
  AiChatResult,
  AiConversationSummary,
  AiSendMessageDto,
  AuthReq,
  ChatHistoryQueryDto,
  success,
} from "@lms/shared";
import { firstValueFrom, timeout } from "rxjs";
import { instrumentRmqClient } from "@lms/filters";
import { AuthGuard } from "../guards/auth.guard";
import { ChatAuthService } from "../services/chat-auth.service";

interface AiMessagesResponse {
  conversation: AiConversationSummary;
  messages: Array<{
    id: string;
    conversationId: string;
    role: "user" | "assistant";
    text: string;
    createdAt: string;
  }>;
  hasMore: boolean;
  nextCursor: string | null;
}

@Controller("ai")
@UseGuards(AuthGuard)
export class AiController {
  constructor(
    @Inject("AGENTS_SERVICE") private readonly agentsClient: ClientProxy,
    private readonly authService: ChatAuthService,
  ) {
    this.agentsClient = instrumentRmqClient(this.agentsClient, "agents");
  }

  @Get("conversations")
  async listConversations(@Req() req: AuthReq) {
    const profile = await this.authService.sessionProfile(req.user);
    return firstValueFrom(
      this.agentsClient
        .send<{ success: boolean; message: string; payload: AiConversationSummary[] }>(
          "agent.listConversations",
          { userId: profile._id },
        )
        .pipe(timeout(12000)),
    );
  }

  @Post("conversations")
  async createConversation(@Req() req: AuthReq) {
    const profile = await this.authService.sessionProfile(req.user);
    return firstValueFrom(
      this.agentsClient
        .send<{ success: boolean; message: string; payload: AiConversationSummary }>(
          "agent.createConversation",
          { userId: profile._id },
        )
        .pipe(timeout(12000)),
    );
  }

  @Get("conversations/:id/messages")
  async getMessages(
    @Req() req: AuthReq,
    @Param("id") id: string,
    @Query() query: ChatHistoryQueryDto,
  ) {
    const profile = await this.authService.sessionProfile(req.user);
    return firstValueFrom(
      this.agentsClient
        .send<{ success: boolean; message: string; payload: AiMessagesResponse }>(
          "agent.getMessages",
          {
            userId: profile._id,
            conversationId: id,
            before: query.before,
            limit: query.limit,
          },
        )
        .pipe(timeout(12000)),
    );
  }

  @Post("chat")
  async chat(@Req() req: AuthReq, @Body() body: AiSendMessageDto) {
    const profile = await this.authService.sessionProfile(req.user);
    return firstValueFrom(
      this.agentsClient
        .send<{ success: boolean; message: string; payload: AiChatResult }>(
          "agent.chat",
          {
            userId: profile._id,
            conversationId: body.conversationId,
            text: body.text,
          },
        )
        .pipe(timeout(60000)),
    );
  }

  @Post("conversations/:id/messages")
  async sendConversationMessage(
    @Req() req: AuthReq,
    @Param("id") id: string,
    @Body() body: AiSendMessageDto,
  ) {
    const profile = await this.authService.sessionProfile(req.user);
    return firstValueFrom(
      this.agentsClient
        .send<{ success: boolean; message: string; payload: AiChatResult }>(
          "agent.chat",
          {
            userId: profile._id,
            conversationId: id,
            text: body.text,
          },
        )
        .pipe(timeout(60000)),
    );
  }
}
