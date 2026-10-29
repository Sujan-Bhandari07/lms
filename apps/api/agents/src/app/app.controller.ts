import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern("agent.listConversations")
  listConversations(@Payload() data: { userId: string }) {
    return this.appService.listConversations(data);
  }

  @MessagePattern("agent.createConversation")
  createConversation(@Payload() data: { userId: string }) {
    return this.appService.createConversation(data);
  }

  @MessagePattern("agent.getMessages")
  getMessages(
    @Payload()
    data: {
      userId: string;
      conversationId: string;
      before?: string;
      limit?: number;
    },
  ) {
    return this.appService.getMessages(data);
  }

  @MessagePattern("agent.chat")
  chat(
    @Payload() data: { userId: string; conversationId?: string; text: string },
  ) {
    return this.appService.chat(data);
  }
}
