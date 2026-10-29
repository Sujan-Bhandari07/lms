import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { ClientProxy } from "@nestjs/microservices";
import {
  ChatConversationOpenPayload,
  ChatHistoryPayload,
  ChatMessage,
  ChatSendPayload,
  ChatSocketAck,
} from "@lms/shared";
import { firstValueFrom, timeout } from "rxjs";
import { instrumentRmqClient } from "@lms/filters";
import { Server, Socket } from "socket.io";
import {
  AuthorizedContact,
  ChatAuthService,
  SessionProfile,
} from "../services/chat-auth.service";

interface SocketSession {
  userId: string;
  role: "student" | "tutor";
  sessionToken: string;
}

interface ChatServiceMessage {
  message: ChatMessage;
  studentUnreadCount: number;
  instructorUnreadCount: number;
  duplicate: boolean;
}

interface TypingTimeout {
  socketId: string;
  timer: ReturnType<typeof setTimeout>;
}

type AuthenticatedSocket = Socket & { data: SocketSession };

const origins = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

@Injectable()
@WebSocketGateway({
  cors: { origin: origins, credentials: true },
  transports: ["websocket", "polling"],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);
  private readonly onlineUsers = new Map<string, Set<string>>();
  private readonly typingTimers = new Map<
    string,
    Map<string, TypingTimeout>
  >();

  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject("CHAT_SERVICE") private readonly chatClient: ClientProxy,
    private readonly authService: ChatAuthService,
  ) {
    this.chatClient = instrumentRmqClient(this.chatClient, "chat");
  }

  afterInit(server: Server) {
    server.use((client, next) => {
      void this.authenticate(client)
        .then(() => next())
        .catch((error: unknown) => {
          if (error instanceof UnauthorizedException) {
            next(new Error("Unauthorized"));
            return;
          }
          this.logger.error(
            `Socket session validation failed: ${this.errorMessage(error)}`,
          );
          next(new Error("Chat authentication is temporarily unavailable."));
        });
    });
  }

  handleConnection(client: Socket) {
    const socket = client as AuthenticatedSocket;
    const sessions =
      this.onlineUsers.get(socket.data.userId) ?? new Set<string>();
    sessions.add(socket.id);
    this.onlineUsers.set(socket.data.userId, sessions);
    void socket.join(this.authService.userRoom(socket.data.userId));
    this.bindEvents(socket);
    void this.broadcastPresence(
      socket.data.userId,
      socket.data.sessionToken,
      true,
    ).catch((error: unknown) =>
      this.logger.warn(
        `Could not update chat presence: ${this.errorMessage(error)}`,
      ),
    );
  }

  handleDisconnect(client: Socket) {
    const socket = client as AuthenticatedSocket;
    const userId = socket.data?.userId;
    if (!userId) return;
    const sessions = this.onlineUsers.get(userId);
    sessions?.delete(socket.id);
    this.clearTypingForSocket(socket);
    if (sessions?.size) return;
    this.onlineUsers.delete(userId);
    void this.broadcastPresence(userId, socket.data.sessionToken, false).catch(
      (error: unknown) =>
        this.logger.warn(
          `Could not update chat presence: ${this.errorMessage(error)}`,
        ),
    );
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  private async broadcastPresence(
    userId: string,
    sessionToken: string,
    online: boolean,
  ) {
    try {
      const profile = await this.authService.sessionProfile(sessionToken);
      const contacts = await this.authService.getAuthorizedContacts(profile);
      for (const { contact } of contacts) {
        this.server
          .to(this.authService.userRoom(contact.userid))
          .emit("chat:presence", {
            participantId: userId,
            online,
          });
      }
    } catch {
      // Ignore presence broadcast errors on disconnect
    }
  }

  broadcastNewMessage(
    authorized: AuthorizedContact,
    message: ChatMessage,
    studentUnreadCount: number,
    instructorUnreadCount: number,
  ) {
    if (!this.server) return;
    this.server
      .to(this.authService.userRoom(authorized.pair.studentId))
      .to(this.authService.userRoom(authorized.pair.instructorId))
      .emit("chat:message:new", message);
    this.broadcastConversationUpdate(
      authorized,
      message,
      studentUnreadCount,
      instructorUnreadCount,
    );
  }

  broadcastReadUpdate(
    authorized: AuthorizedContact,
    result: {
      conversationId: string;
      unreadCount: number;
      studentUnreadCount: number;
      instructorUnreadCount: number;
    },
  ) {
    if (!this.server) return;
    this.server
      .to(this.authService.userRoom(authorized.pair.studentId))
      .emit("chat:conversation:read", {
        conversationId: result.conversationId,
        unreadCount: result.studentUnreadCount,
      });
    this.server
      .to(this.authService.userRoom(authorized.pair.instructorId))
      .emit("chat:conversation:read", {
        conversationId: result.conversationId,
        unreadCount: result.instructorUnreadCount,
      });
  }

  private async authenticate(client: Socket) {
    const origin = client.handshake.headers.origin;
    if (origin && !origins.includes(origin)) {
      throw new UnauthorizedException("This chat origin is not allowed.");
    }
    const token = this.cookieValue(client.handshake.headers.cookie, "token");
    if (!token) throw new UnauthorizedException("A session is required.");
    const profile = await this.authService.sessionProfile(token);
    (client as AuthenticatedSocket).data = {
      userId: String(profile._id),
      role: profile.role as "student" | "tutor",
      sessionToken: token,
    };
  }

  private bindEvents(socket: AuthenticatedSocket) {
    this.bindEvent(socket, "chat:conversations:list", async () =>
      this.listConversations(socket),
    );
    this.bindEvent(
      socket,
      "chat:conversation:open",
      async (payload: ChatConversationOpenPayload) =>
        this.openConversation(socket, payload),
    );
    this.bindEvent(
      socket,
      "chat:messages:history",
      async (payload: ChatHistoryPayload) => this.getHistory(socket, payload),
    );
    this.bindEvent(
      socket,
      "chat:message:send",
      async (payload: ChatSendPayload) => this.sendMessage(socket, payload),
    );
    this.bindEvent(
      socket,
      "chat:messages:read",
      async (payload: ChatConversationOpenPayload) =>
        this.markRead(socket, payload),
    );
    this.bindEvent(
      socket,
      "chat:typing:start",
      async (payload: ChatConversationOpenPayload) =>
        this.setTyping(socket, payload, true),
    );
    this.bindEvent(
      socket,
      "chat:typing:stop",
      async (payload: ChatConversationOpenPayload) =>
        this.setTyping(socket, payload, false),
    );
  }

  private bindEvent<P, R>(
    socket: AuthenticatedSocket,
    event: string,
    handler: (payload: P) => Promise<R>,
  ) {
    socket.on(event, (payload: unknown, acknowledge?: unknown) => {
      const reply =
        typeof acknowledge === "function"
          ? (acknowledge as (value: ChatSocketAck<R>) => void)
          : undefined;
      void handler(payload as P)
        .then((result) => {
          if (reply) reply({ success: true, payload: result });
          else
            socket.emit("chat:error", {
              code: "ACK_REQUIRED",
              message: "A response callback is required.",
            });
        })
        .catch((error: unknown) => {
          const response = this.toSocketError(error);
          if (reply) reply({ success: false, error: response });
          else socket.emit("chat:error", response);
          if (response.code === "401") {
            socket.emit("chat:session:invalid");
            socket.disconnect(true);
          }
        });
    });
  }

  private async listConversations(socket: AuthenticatedSocket) {
    const profile = await this.currentProfile(socket);
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
    return {
      conversations: summaries
        .flatMap((summary) => {
          const contact = contactById.get(summary.participantId);
          if (!contact) return [];
          return [
            {
              ...summary,
              contact,
              online: this.onlineUsers.has(contact.userid),
            },
          ];
        })
        .sort(
          (left, right) =>
            new Date(right.lastMessageAt ?? 0).getTime() -
            new Date(left.lastMessageAt ?? 0).getTime(),
        ),
    };
  }

  private async openConversation(
    socket: AuthenticatedSocket,
    payload: ChatConversationOpenPayload,
  ) {
    const profile = await this.currentProfile(socket);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      payload?.participantId,
    );
    const pair = authorized.pair;
    const opened = await firstValueFrom(
      this.chatClient
        .send<{ conversationId: string }>("chat.openConversation", {
          userId: profile._id,
          ...pair,
        })
        .pipe(timeout(10000)),
    );
    await socket.join(this.authService.conversationRoom(opened.conversationId));
    const history = await firstValueFrom(
      this.chatClient
        .send<{
          conversationId: string;
          messages: ChatMessage[];
          hasMore: boolean;
          nextCursor: string | null;
        }>("chat.getMessages", {
          userId: profile._id,
          ...pair,
        })
        .pipe(timeout(10000)),
    );
    const read = await firstValueFrom(
      this.chatClient
        .send<{
          conversationId: string;
          unreadCount: number;
          studentUnreadCount: number;
          instructorUnreadCount: number;
        }>("chat.markRead", { userId: profile._id, ...pair })
        .pipe(timeout(10000)),
    );
    this.broadcastReadUpdate(authorized, read);
    return { ...history, contact: authorized.contact };
  }

  private async getHistory(
    socket: AuthenticatedSocket,
    payload: ChatHistoryPayload,
  ) {
    const profile = await this.currentProfile(socket);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      payload?.participantId,
    );
    return firstValueFrom(
      this.chatClient
        .send("chat.getMessages", {
          userId: profile._id,
          ...authorized.pair,
          before: payload?.before,
          limit: payload?.limit,
        })
        .pipe(timeout(10000)),
    );
  }

  private async sendMessage(
    socket: AuthenticatedSocket,
    payload: ChatSendPayload,
  ) {
    const profile = await this.currentProfile(socket);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      payload?.participantId,
    );
    if (
      typeof payload?.text !== "string" ||
      !payload.text.trim() ||
      payload.text.length > 4000 ||
      typeof payload.clientMessageId !== "string"
    ) {
      throw new BadRequestException("Enter a message of 1 to 4000 characters.");
    }
    const result = await firstValueFrom(
      this.chatClient
        .send<ChatServiceMessage>("chat.sendMessage", {
          ...authorized.pair,
          senderId: profile._id,
          clientMessageId: payload.clientMessageId,
          text: payload.text,
        })
        .pipe(timeout(10000)),
    );
    if (!result.duplicate) {
      this.broadcastNewMessage(
        authorized,
        result.message,
        result.studentUnreadCount,
        result.instructorUnreadCount,
      );
    }
    return {
      message: result.message,
      unreadCount:
        profile._id === authorized.pair.studentId
          ? result.studentUnreadCount
          : result.instructorUnreadCount,
    };
  }

  private async markRead(
    socket: AuthenticatedSocket,
    payload: ChatConversationOpenPayload,
  ) {
    const profile = await this.currentProfile(socket);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      payload?.participantId,
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
    this.broadcastReadUpdate(authorized, result);
    return result;
  }

  private async setTyping(
    socket: AuthenticatedSocket,
    payload: ChatConversationOpenPayload,
    typing: boolean,
  ) {
    const profile = await this.currentProfile(socket);
    const authorized = await this.authService.findAuthorizedContact(
      profile,
      payload?.participantId,
    );
    const pairKey = this.authService.pairKey(
      authorized.pair.studentId,
      authorized.pair.instructorId,
    );
    const summaries = await firstValueFrom(
      this.chatClient
        .send<{ pairKey: string; conversationId: string | null }[]>(
          "chat.listConversations",
          {
            userId: profile._id,
            pairs: [authorized.pair],
          },
        )
        .pipe(timeout(10000)),
    );
    const conversationId = summaries.find(
      (summary) => summary.pairKey === pairKey,
    )?.conversationId;
    if (!conversationId) {
      throw new ForbiddenException("Open the conversation before typing.");
    }
    const room = this.authService.conversationRoom(conversationId);
    if (!socket.rooms.has(room)) {
      throw new ForbiddenException("Open the conversation before typing.");
    }
    socket.to(room).emit("chat:typing", {
      participantId: profile._id,
      typing,
    });
    this.updateTypingTimeout(socket, conversationId, typing);
    return { sent: true };
  }

  private updateTypingTimeout(
    socket: AuthenticatedSocket,
    conversationId: string,
    typing: boolean,
  ) {
    const userId = socket.data.userId;
    const conversations = this.typingTimers.get(userId) ?? new Map();
    const existing = conversations.get(conversationId);
    if (existing) clearTimeout(existing.timer);
    conversations.delete(conversationId);
    if (typing) {
      const timer = setTimeout(() => {
        const current = this.typingTimers.get(userId);
        if (current?.get(conversationId)?.socketId !== socket.id) return;
        current.delete(conversationId);
        if (!current.size) this.typingTimers.delete(userId);
        this.server
          .to(this.authService.conversationRoom(conversationId))
          .emit("chat:typing", { participantId: userId, typing: false });
      }, 4000);
      conversations.set(conversationId, { socketId: socket.id, timer });
      this.typingTimers.set(userId, conversations);
    } else if (!conversations.size) {
      this.typingTimers.delete(userId);
    }
  }

  private clearTypingForSocket(socket: AuthenticatedSocket) {
    const userId = socket.data.userId;
    const conversations = this.typingTimers.get(userId);
    if (!conversations) return;
    for (const [conversationId, entry] of conversations) {
      if (entry.socketId !== socket.id) continue;
      clearTimeout(entry.timer);
      conversations.delete(conversationId);
      this.server
        .to(this.authService.conversationRoom(conversationId))
        .emit("chat:typing", { participantId: userId, typing: false });
    }
    if (!conversations.size) this.typingTimers.delete(userId);
  }

  private async currentProfile(socket: AuthenticatedSocket) {
    const profile = await this.authService.sessionProfile(
      socket.data.sessionToken,
    );
    if (
      String(profile._id) !== socket.data.userId ||
      profile.role !== socket.data.role
    ) {
      throw new UnauthorizedException("Your session is no longer valid.");
    }
    return profile;
  }

  private broadcastConversationUpdate(
    authorized: AuthorizedContact,
    message: ChatMessage,
    studentUnreadCount: number,
    instructorUnreadCount: number,
  ) {
    const pairKey = this.authService.pairKey(
      authorized.pair.studentId,
      authorized.pair.instructorId,
    );
    this.server
      .to(this.authService.userRoom(authorized.pair.studentId))
      .emit("chat:conversation:updated", {
        pairKey,
        participantId: authorized.pair.instructorId,
        latestMessage: message.text,
        lastMessageAt: message.createdAt,
        unreadCount: studentUnreadCount,
      });
    this.server
      .to(this.authService.userRoom(authorized.pair.instructorId))
      .emit("chat:conversation:updated", {
        pairKey,
        participantId: authorized.pair.studentId,
        latestMessage: message.text,
        lastMessageAt: message.createdAt,
        unreadCount: instructorUnreadCount,
      });
  }

  private cookieValue(cookieHeader: string | undefined, name: string) {
    const item = cookieHeader
      ?.split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(`${name}=`));
    if (!item) return null;
    try {
      return decodeURIComponent(item.slice(name.length + 1));
    } catch {
      return null;
    }
  }

  private toSocketError(error: unknown) {
    if (error instanceof HttpException) {
      return {
        code: String(error.getStatus()),
        message: error.message,
      };
    }
    if (typeof error === "object" && error !== null && "status" in error) {
      const status = Number(error.status);
      const message =
        "message" in error && typeof error.message === "string"
          ? error.message
          : undefined;
      if ([400, 401, 403, 404, 409, 502].includes(status) && message) {
        return { code: String(status), message };
      }
    }
    this.logger.error(`Chat operation failed: ${this.errorMessage(error)}`);
    return {
      code: "500",
      message: "The chat request could not be completed.",
    };
  }

  private errorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "unknown error";
  }
}
