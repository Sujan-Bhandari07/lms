import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AiConversationDocument = HydratedDocument<AiConversation>;

@Schema({ timestamps: true })
export class AiConversation {
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: String, required: true, default: "New conversation" })
  title!: string;

  @Prop({ type: String, default: "" })
  lastMessagePreview!: string;

  @Prop({ type: Date, default: null })
  lastMessageAt!: Date | null;
}

export const aiConversationSchema =
  SchemaFactory.createForClass(AiConversation);
aiConversationSchema.index({ userId: 1, updatedAt: -1 });
