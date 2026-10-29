import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DbModule } from "@lms/db";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import {
  AiConversation,
  aiConversationSchema,
} from "./schema/ai-conversation.schema";
import { AiMessage, aiMessageSchema } from "./schema/ai-message.schema";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule.forRoot(process.env.MONGO_AGENTS_URI ?? process.env.MONGO_URI),
    DbModule.forFeature([
      { name: AiConversation.name, schema: aiConversationSchema },
    ]),
    DbModule.forFeature([{ name: AiMessage.name, schema: aiMessageSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
