import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DbModule } from "@lms/db";
import { ConfigModule } from "@nestjs/config";
import { Conversation, conversationSchema } from "./schema/conversation.schema";
import { Message, messageSchema } from "./schema/message.schema";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule.forRoot(process.env.MONGO_URI),
    DbModule.forFeature([
      { name: Conversation.name, schema: conversationSchema },
    ]),
    DbModule.forFeature([{ name: Message.name, schema: messageSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
