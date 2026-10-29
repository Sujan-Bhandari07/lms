import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AiMessageDocument = HydratedDocument<AiMessage>;

@Schema({ timestamps: true })
export class AiMessage {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: "AiConversation",
    index: true,
  })
  conversationId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ["user", "assistant"] })
  role!: "user" | "assistant";

  @Prop({ type: String, required: true, maxlength: 16000 })
  text!: string;

  createdAt!: Date;
}

export const aiMessageSchema = SchemaFactory.createForClass(AiMessage);
aiMessageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });
