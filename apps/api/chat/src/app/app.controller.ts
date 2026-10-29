import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { ChatEligiblePair } from "@lms/shared";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly chatService: AppService) {}

  @MessagePattern("chat.listConversations")
  listConversations(
    @Payload() data: { userId: string; pairs: ChatEligiblePair[] },
  ) {
    return this.chatService.listConversations(data);
  }

  @MessagePattern("chat.openConversation")
  openConversation(
    @Payload()
    data: {
      userId: string;
      studentId: string;
      instructorId: string;
      courseIds: string[];
    },
  ) {
    return this.chatService.openConversation(data);
  }

  @MessagePattern("chat.getMessages")
  getMessages(
    @Payload()
    data: {
      userId: string;
      studentId: string;
      instructorId: string;
      courseIds: string[];
      before?: string;
      limit?: number;
    },
  ) {
    return this.chatService.getMessages(data);
  }

  @MessagePattern("chat.sendMessage")
  sendMessage(
    @Payload()
    data: {
      senderId: string;
      studentId: string;
      instructorId: string;
      courseIds: string[];
      clientMessageId: string;
      text: string;
    },
  ) {
    return this.chatService.sendMessage(data);
  }

  @EventPattern("chat.ensureEnrollmentConversation")
  ensureEnrollmentConversation(
    @Payload()
    data: {
      studentId: string;
      instructorId: string;
      courseIds: string[];
    },
  ) {
    return this.chatService.openConversation({
      ...data,
      userId: data.studentId,
    });
  }

  @MessagePattern("chat.markRead")
  markRead(
    @Payload()
    data: {
      userId: string;
      studentId: string;
      instructorId: string;
      courseIds: string[];
    },
  ) {
    return this.chatService.markRead(data);
  }
}
