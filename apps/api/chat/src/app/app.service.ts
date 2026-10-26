import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IGetConversation, ISendMessage, success } from "@lms/shared";
import { Message, MessageDocument } from "./schema/message.schema";
import {
  Conversation,
  ConversationDocument,
} from "./schema/conversation.schema";

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Message.name)
    private readonly messagemodel: Model<MessageDocument>,
    @InjectModel(Conversation.name)
    private readonly conversationmodel: Model<ConversationDocument>,
  ) {}

  async sendmessage(data: ISendMessage) {
    const { sender, receiver, message } = data;
    let conversation = await this.conversationmodel.findOne({
      participants: {
        $all: [sender.userid, receiver.userid],
      },
    });

    if (!conversation) {
      conversation = await this.conversationmodel.create({
        participants: [sender.userid, receiver.userid],
      });
    }

    const newmessage = await this.messagemodel.create({
      sender,
      receiver,
      message,
    });
    if (!newmessage) {
      throw new InternalServerErrorException(
        "Something went wrong with chat db.",
      );
    }
    conversation.messages.push(newmessage._id);
    await conversation.save();
    return success("Message sent !", message);
  }

  async getconversation(data: IGetConversation) {
    const { sender, receiver } = data;
    const conversation = await this.conversationmodel
      .findOne({
        participants: [sender, receiver],
      })
      .populate("messages");

    if (!conversation) throw new NotFoundException("Conversation not found");

    return success("Conversation found", conversation);
  }
  
}
