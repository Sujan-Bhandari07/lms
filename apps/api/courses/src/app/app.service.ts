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
  PublicCoursesQueryDto,
  UpdateCourseDto,
} from "@lms/shared";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AppService {
  constructor(
    @Inject("NOTIFICATION_SERVICE")
    private readonly notificationClient: ClientProxy,
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
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

    const url = await this.media.upload(title,"course")
    const course = await this.coursesmodel.create({
      title:url.url,
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
    const user = await firstValueFrom(
      this.usersClient.send("getusernotification", {
        userid: course.tutor.tutorid,
      }),
    );
    this.notificationClient.emit("verifiedcourseemail", {
      fullname: user.fullname,
      email: user.email,
      coursename: course.coursename,
    });
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

  async getTutorCoursesForChat(data: { tutorid: string }) {
    if (!data.tutorid?.trim()) {
      throw new BadRequestException("A tutor id is required.");
    }
    const courses = await this.coursesmodel
      .find({ "tutor.tutorid": data.tutorid })
      .select("_id coursename tutor isverified")
      .lean();
    return success("Tutor courses found.", courses);
  }

  async updateenrolled(data: IUserCourse) {
    const { userid, username, courseid } = data;
    const course = await this.coursesmodel.findById(courseid);
    if (!course) throw new NotFoundException("Course not found");
    await this.coursesmodel.updateOne(
      {
        _id: course._id,
        "totalenrolledstudents.userid": { $ne: userid },
      },
      {
        $push: { totalenrolledstudents: { userid, username } },
      },
    );
  }

  async updatecompletion(data: IUserCourse) {
    const { userid, username, courseid } = data;
    const course = await this.coursesmodel.findById(courseid);
    if (!course) throw new NotFoundException("Course not found");

    if (!course.providecompletionoption){

      throw new BadRequestException(
        "This course is running so cant be set as completed.",
      );
    }
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

  async getPublicCourses(query: PublicCoursesQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const filter: Record<string, unknown> = { isverified: true };
    if (query.q?.trim()) {
      const escaped = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { coursename: { $regex: escaped, $options: "i" } },
        { desc: { $regex: escaped, $options: "i" } },
        { techstack: { $regex: escaped, $options: "i" } },
        { "tutor.tutorname": { $regex: escaped, $options: "i" } },
      ];
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {
        ...(query.minPrice !== undefined && { $gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { $lte: query.maxPrice }),
      };
    }
    let sortBy: Record<string, 1 | -1> = { createdAt: -1 };
    if (query.sort === "popular") sortBy = { enrollmentCount: -1, createdAt: -1 };
    if (query.sort === "price-asc") sortBy = { price: 1, createdAt: -1 };
    if (query.sort === "price-desc") sortBy = { price: -1, createdAt: -1 };
    if (query.sort === "rating") sortBy = { averageRating: -1, createdAt: -1 };
    const [records, total] = await Promise.all([
      this.coursesmodel.aggregate([
        { $match: filter },
        {
          $addFields: {
            enrollmentCount: { $size: { $ifNull: ["$totalenrolledstudents", []] } },
            averageRating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
          },
        },
        { $sort: sortBy },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: { totalenrolledstudents: 0, totalcoursecompletions: 0, "parts.videourl": 0 } },
      ]),
      this.coursesmodel.countDocuments(filter),
    ]);
    return success("Courses found", {
      items: records,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  }

  async getPendingCourses() {
    const courses = await this.coursesmodel
      .find({ isverified: { $ne: true } })
      .select("coursename title desc techstack tutor price discount createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return success("Pending courses found", courses);
  }

  async getPublicCourseById(courseid: string) {
    if (!/^[a-f\d]{24}$/i.test(courseid)) {
      throw new BadRequestException("Invalid course id.");
    }
    const course = await this.coursesmodel.findOne({ _id: courseid, isverified: true }).lean();
    if (!course) throw new NotFoundException("Course not found.");
    const [result] = await this.coursesmodel.aggregate([
      { $match: { _id: course._id } },
      {
        $addFields: {
          enrollmentCount: { $size: { $ifNull: ["$totalenrolledstudents", []] } },
          averageRating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
        },
      },
      { $project: { totalenrolledstudents: 0, totalcoursecompletions: 0, "parts.videourl": 0 } },
    ]);
    return success("Course found", result);
  }

  async getCourseById(courseid: string) {
    if (!/^[a-f\d]{24}$/i.test(courseid)) {
      throw new BadRequestException("Invalid course id.");
    }
    const course = await this.coursesmodel.findById(courseid).lean();
    if (!course) throw new NotFoundException("Course not found.");
    return success("Course found", course);
  }

  async updateOwnedCourse(data: UpdateCourseDto & { courseid: string; photo?: string }) {
    if (!/^[a-f\d]{24}$/i.test(data.courseid)) {
      throw new BadRequestException("Invalid course id.");
    }
    const course = await this.coursesmodel.findById(data.courseid);
    if (!course) throw new NotFoundException("Course not found.");

    if (data.coursename !== undefined) course.coursename = data.coursename.trim();
    if (data.desc !== undefined) course.desc = data.desc.trim();
    if (data.techstack !== undefined) course.techstack = data.techstack.trim();
    if (data.price !== undefined || data.discount !== undefined) {
      if (data.price === undefined || data.discount === undefined) {
        throw new BadRequestException("Provide both price and discount when changing course pricing.");
      }
      course.price = data.price;
      course.discount = data.discount;
    }
    if (data.photo) {
      const uploaded = await this.media.upload(data.photo, "course");
      if (!uploaded?.url) throw new InternalServerErrorException("Course photo upload failed.");
      course.title = uploaded.url;
    }

    await course.save();
    return success("Course updated successfully.", course);
  }

  async getAllCourse() {
    const courses = await this.coursesmodel.find({});
    if (!courses.length) {
      return "No courses is currently available. Pls satye tuned for upcoming updates";
    }
    return courses;
  }

  async getspecificcourse(data: { name: string }) {
    const words = data.name.trim().split(/\s+/);

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
    if (!courses) return "No course was found";

    return courses;
  }



  
}
