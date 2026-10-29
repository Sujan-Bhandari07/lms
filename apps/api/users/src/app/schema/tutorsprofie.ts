import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";


type TutorsDocument = HydratedDocument<Tutors>

@Schema({ timestamps: true })
 class Tutors {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userid: Types.ObjectId;
  @Prop({ type: Boolean, default: false, required: true })
  isverified: boolean;
  @Prop({ type: String, enum: ["pending", "approved", "rejected"], default: "pending" })
  verificationStatus?: "pending" | "approved" | "rejected";
  @Prop({ type: String, })
  experience: string;
  @Prop({ type: String})
  acedemics: string;
  @Prop({ type: [String], default: [] })
  certificates?: string[];
}

const TutorsSchema = SchemaFactory.createForClass(Tutors)
export {TutorsSchema,Tutors,TutorsDocument}
