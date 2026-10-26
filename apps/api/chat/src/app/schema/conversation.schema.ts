import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Message, messageSchema } from "./message.schema";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type ConversationDocument = HydratedDocument<Conversation>

@Schema({ _id: false })
export class User {
  userid: string;
  username: string;
}
export const userSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [String], default: [] })
  participants: string[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], required: true ,ref:"Message"})
  messages: Types.ObjectId[];
}
export const conversationSchema= SchemaFactory.createForClass(Conversation)
