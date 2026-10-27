import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { REDIS_CLIENT } from "@lms/redis";
import Redis from "ioredis";
import { InjectModel } from "@nestjs/mongoose";
import { Courses, CoursesDocument } from "./schema/course.schema";
import { Model } from "mongoose";
import { MediaClient } from "@lms/medias";
import {
  ICreateCourse,
  IGetTutorCourse,
  IProvideRating,
  ISendComment,
  IUploadpart,
  IUserCourse,
  IVerifyCourse,
  ICourceCompletion,
  success,
  IUpdateUserInCourse,
} from "@lms/shared";

@Injectable()
export class AppService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectModel(Courses.name)
    private readonly coursesmodel: Model<CoursesDocument>,
    private readonly media: MediaClient,
  ) {}

  async createcourse(data: ICreateCourse) {
    const {
      title,
      desc,
      coursename,
      price,
      discount = 0,
      techstack,
      tutor,
    } = data;
    const priceAfterDiscount = price - (discount / 100) * price;
    const course = await this.coursesmodel.create({
      title,
      desc,
      coursename,
      price: priceAfterDiscount,
      discount,
      techstack,
      tutor,
    });
    if (!course) {
      throw new InternalServerErrorException("Something went wrong.");
    }
    return success("Course created successfully.", course);
  }

  async verifyCourse(data: IVerifyCourse) {
    const { verify, courseid } = data;
    const course = await this.coursesmodel.findById(courseid);
    if (!course) {
      throw new NotFoundException("Course not found");
    }

    course.isverified = verify;
    await course.save();
    return success("Course verified Successfully");
  }

  async sendComment(data: ISendComment) {
    const { comment, studentname, courseid } = data;
    const course = await this.coursesmodel.findById(courseid);
    if (!course) {
      throw new NotFoundException("Course not found");
    }
    course.comments.push({
      comment,
      studentname,
    });
    await course.save();
    return success("Commented !");
  }

  async provideRating(data: IProvideRating) {
    const { rating, studentname, courseid } = data;
    const course = await this.coursesmodel.findById(courseid);
    if (!course) {
      throw new NotFoundException("Course not found");
    }
    course.ratings.push({
      rating,
      studentname,
    });
    await course.save();
    return success("Rated !");
  }

  async uploadPart(data: IUploadpart) {
    const { courseid, videourl, title, partdesc } = data;
    const course = await this.coursesmodel.findById(courseid);
    if (!course) {
      throw new NotFoundException("Course not found");
    }
    if (!course.isverified) {
      throw new BadRequestException(
        "Pls wait until the admin variify your course.",
      );
    }
    const url = await this.media.upload(videourl, "courses");
    if (!url) {
      throw new InternalServerErrorException(
        "Something wen t wrong with cloudinary.",
      );
    }
    course.parts.push({
      title,
      partdesc,
      videourl: url.url,
    });
    await course.save();
    return success("Part updated successfully");
  }

  async getCoursesByTutor(data: IGetTutorCourse) {
    const { tutorid, tutorname } = data;
    const courses = await this.coursesmodel.find({
      tutor: {
        tutorid,
        tutorname,
      },
    });

    if (!courses) {
      throw new NotFoundException("You havent created a course.");
    }
    return success("Course found", courses);
  }

  async updateenrolled(data: IUserCourse) {
    const { userid, username, courseid } = data;
    const course = await this.coursesmodel.findById(courseid);
    if (!course) throw new NotFoundException("Course not found");
    course.totalenrolledstudents.push({
      userid,
      username,
    });
    await course.save();
  }

  async updatecompletion(data: IUserCourse) {
    const { userid, username, courseid } = data;
    const course = await this.coursesmodel.findById(courseid);
    if (!course) throw new NotFoundException("Course not found");
    course.totalcoursecompletions.push({
      userid,
      username,
    });
    await course.save();
  }

  async providecompletionoption(data: ICourceCompletion) {
    const course = await this.coursesmodel.findById(data.courseid);
    if (!course) {
      throw new NotFoundException("Course not found");
    }
    course.providecompletionoption = !course.providecompletionoption;
    await course.save();
    return success("toggled");
  }

  async updateprofile(data: IUpdateUserInCourse) {
    const { userid, username, role } = data;

    if (role === "tutor") {
      await this.coursesmodel.updateMany(
        { "tutor.tutorid": userid },
        { $set: { "tutor.tutorname": username } },
      );
    } else if (role === "student") {
      await this.coursesmodel.updateMany(
        {
          $or: [
            { "totalcoursecompletions.userid": userid },
            { "totalenrolledstudents.userid": userid },
          ],
        },
        {
          $set: {
            "totalcoursecompletions.$[student1].username": username,
            "totalenrolledstudents.$[student2].username": username,
          },
        },
        {
          arrayFilters: [
            { "student1.userid": userid },
            { "student2.userid": userid },
          ],
        },
      );
    }
  }

  async getallstudents(data: { tutorid: string }) {
    const course = await this.coursesmodel.find({
      "tutor.tutorid": data.tutorid,
    });
    if (!course) throw new NotFoundException("No course is found.");

    const students = course.map((item) => item.totalenrolledstudents);
    if (!students) {
      throw new NotFoundException("No students has enrolled your course");
    }
    const flatten = students.flat(Infinity);
    return success("students", flatten);
  }

  async getAllCourse() {
    const courses = await this.coursesmodel.find({});
    if (!courses.length){

      return "No courses is currently available. Pls satye tuned for upcoming updates";
    }
return courses
  }


  async getspecificcourse(data:{
    name:string
  }){

  const words =data.name.trim().split(/\s+/);

  const courses = await this.coursesmodel.find({
    $or: words.flatMap((word) => {
      const regex = new RegExp(
        word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      return [
        { coursename: regex },
        { title: regex },
        { description: regex },
      ];
    }),
  });
  if(!courses)return "No course was found"

  return courses;

  }
}
