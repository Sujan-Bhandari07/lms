import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CoursesDocument = HydratedDocument<Courses>

@Schema({ timestamps: true })
@Schema({ _id: false, timestamps: true })
class Parts {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  chapterdesc: string;

  @Prop({ type: String, required: true })
  videourl: string;
}

const partsSchema = SchemaFactory.createForClass(Parts);

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
  comment: number;
}

const commentSchema = SchemaFactory.createForClass(Comment);

export class Courses {
  @Prop({ type: String, required: true })
  coursename: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  desc: string;

  @Prop({ type: String, required: true })
  techstack: string;

  @Prop({ type: String, required: true })
  tutorname: string;

  @Prop({ type: Boolean, required: true, default: false })
  isverified: boolean;

  @Prop({ type: [partsSchema], default: [] })
  parts: Parts[];

  @Prop({ type: [String], required: true, default: [] })
  totalenrolledstudents: string[];

  @Prop({ type: [String], required: true, default: [] })
  totalcoursecompletions: string[];

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  discount: number;

  @Prop({ type: Boolean, required: true, default: false })
  isbestcourse: boolean;

  @Prop({ type: [ratingSchema], default: [] })
  ratings: Rating[];

  @Prop({ type: [commentSchema], default: [] })
  comments: Comment[];
}

export const coursesSchema= SchemaFactory.createForClass(Courses)
