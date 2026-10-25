import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CoursesDocument = HydratedDocument<Courses>;

@Schema({ _id: false, timestamps: true })
class User {
  @Prop({ type: String, required: true })
  userid: string;

  @Prop({ type: String, required: true })
  username: string;
}

const userSchema = SchemaFactory.createForClass(User)

@Schema({ _id: false, timestamps: true })
class Parts {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  partdesc: string;

  @Prop({ type: String, required: true })
  videourl: string;
}

const partsSchema = SchemaFactory.createForClass(Parts);
@Schema({ _id: false })
class Tutor {
  @Prop({ type: String, required: true })
  tutorid: string;
  @Prop({ type: String, required: true })
  tutorname: string;
}
const tutorSchema = SchemaFactory.createForClass(Tutor);

@Schema({ _id: false, timestamps: true })
class Rating {
  @Prop({ type: String, required: true })
  studentname: string;

  @Prop({ type: Number, required: true })
  rating: number;
}

const ratingSchema = SchemaFactory.createForClass(Rating);

@Schema({ _id: false, timestamps: true })
class Comment {
  @Prop({ type: String, required: true })
  studentname: string;

  @Prop({ type: String, required: true })
  comment: string;
}

const commentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Courses {
  @Prop({ type: String, required: true })
  coursename: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  desc: string;

  @Prop({ type: String, required: true })
  techstack: string;

  @Prop({ type: tutorSchema, required: true })
  tutor: Tutor;

  @Prop({ type: Boolean, required: true, default: false })
  isverified: boolean;

  @Prop({ type: [partsSchema], default: [] })
  parts: Parts[];

  @Prop({ type: [userSchema], required: true, default: [] })
  totalenrolledstudents: User[];

  @Prop({ type: [userSchema], required: true, default: [] })
  totalcoursecompletions: User[];

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  discount: number;

  @Prop({ type: Boolean, required: true, default: false })
  isbestcourse: boolean;


  @Prop({ type: Boolean, required: true, default: false })
  providecompletionoption: boolean;

  @Prop({ type: [ratingSchema], default: [] })
  ratings: Rating[];

  @Prop({ type: [commentSchema], default: [] })
  comments: Comment[];
}

export const coursesSchema = SchemaFactory.createForClass(Courses);
