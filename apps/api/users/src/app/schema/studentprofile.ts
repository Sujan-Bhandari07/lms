import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Mongoose, Types } from "mongoose";

@Schema({ _id: false, timestamps: true })
class Certificate {
  @Prop({ type: String, required: true })
  coursename: string;


  @Prop({ type: mongoose.Schema.Types.ObjectId })
  courseid: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Tutors" })
  tutor: Types.ObjectId;
}

const Certificateschema = SchemaFactory.createForClass(Certificate);

@Schema({ _id: false, timestamps: true })
class En extends Certificate {
  @Prop({ type: Boolean, default: false })
  iscompleted: boolean;

  

  // @Prop({ type: String, required: true })
  // coursename: string;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, required: true,ref:"Tutors" })
  // tutor: Types.ObjectId;
}

const Enrolledschema = SchemaFactory.createForClass(En);

export type StudentsDocument = HydratedDocument<Students>;

@Schema({ timestamps: true })
export class Students {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userid: Types.ObjectId;

  @Prop({ type: [Certificateschema], default: [] })
  certificates: Certificate[];
  @Prop({ type: [Enrolledschema], default: [] })
  enrolledcourses: En[];
}
export const Studentsschema = SchemaFactory.createForClass(Students);
