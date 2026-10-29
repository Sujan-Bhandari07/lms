import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: String, required: true })
  pairKey!: string;

  @Prop({ type: String, required: true })
  studentId!: string;

  @Prop({ type: String, required: true })
  instructorId!: string;

  @Prop({ type: [String], required: true })
  participants!: string[];

  @Prop({ type: [String], default: [] })
  courseIds!: string[];

  @Prop({ type: String, default: "" })
  lastMessagePreview!: string;

  @Prop({ type: Date, default: null })
  lastMessageAt!: Date | null;

  @Prop({ type: Number, default: 0 })
  studentUnreadCount!: number;

  @Prop({ type: Number, default: 0 })
  instructorUnreadCount!: number;
}

export const conversationSchema = SchemaFactory.createForClass(Conversation);
conversationSchema.index({ pairKey: 1 }, { unique: true });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
