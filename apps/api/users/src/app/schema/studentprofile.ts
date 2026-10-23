import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

@Schema({ _id: false })
class Certificate {
  @Prop({ type: String, required: true })
  coursename: string;
  @Prop({ type: String, required: true })
  completiondate: string;
  @Prop({ type: String, required: true })
  tutor: string;
}

const Certificateschema = SchemaFactory.createForClass(Certificate);

@Schema({_id:false,timestamps:true})
class En {
  @Prop({ type: String, required: true })
  coursename: string;

  @Prop({ type: String, required: true })
  tutor: string;
}

const Enrolledschema = SchemaFactory.createForClass(En);

export type StudentsDocument = HydratedDocument<Students>;

@Schema({ timestamps: true})
export class Students {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userid: Types.ObjectId;

  @Prop({ type: [Certificateschema], default: [] })
  certificates: Certificate[];
  @Prop({ type: [Enrolledschema], default: [] })
  enrolledcourses: En[];
}
export const Studentsschema = SchemaFactory.createForClass(Students);
