import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: "Conversation",
    index: true,
  })
  conversationId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  senderId!: string;

  @Prop({ type: String, required: true })
  clientMessageId!: string;

  @Prop({ type: String, required: true, maxlength: 4000 })
  text!: string;

  @Prop({ type: Date, default: null })
  readAt!: Date | null;

  createdAt!: Date;
}

export const messageSchema = SchemaFactory.createForClass(Message);
messageSchema.index(
  { senderId: 1, clientMessageId: 1 },
  { unique: true },
);
messageSchema.index({ conversationId: 1, createdAt: -1 });
