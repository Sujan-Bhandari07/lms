import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";


type TutorsDocument = HydratedDocument<Tutors>

@Schema({ timestamps: true })
 class Tutors {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userid: Types.ObjectId;
  @Prop({ type: Boolean, default: false, required: true })
  isverified: boolean;
  @Prop({ type: String, })
  experience: string;
  @Prop({ type: String})
  acedemics: string;
}

const TutorsSchema = SchemaFactory.createForClass(Tutors)
export {TutorsSchema,Tutors,TutorsDocument}
