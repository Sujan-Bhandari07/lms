import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User, userSchema } from "./conversation.schema";
import { HydratedDocument } from "mongoose";

export type MessageDocument = HydratedDocument<Message>

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: userSchema, required: true })
  sender: User;

  @Prop({ type: userSchema, required: true })
  receiver: User;

  @Prop({ type: String, required: true })
  message: string;
  @Prop({ type: Date, required: true, default: null })
  readat: Date;
}

export const messageSchema = SchemaFactory.createForClass(Message)
