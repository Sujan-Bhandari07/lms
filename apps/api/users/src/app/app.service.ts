import { REDIS_CLIENT } from "@lms/redis";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import Redis from "ioredis";
import {
  ICompleteCourse,
  ICreateCertificate,
  ILogin,
  IRegister,
  IUpdateEnrolledCourse,
  IUpdateTutor,
  IUpdateUser,
  IUpdateUserInCourse,
  IverifyTutor,
  success,
} from "@lms/shared";
import { InjectModel } from "@nestjs/mongoose";
import { UserDocument, Users } from "./schema/userschema";
import { Model, Types } from "mongoose";
import { Students, StudentsDocument } from "./schema/studentprofile";
import { Tutors } from "./schema/tutorsprofie";
import bcrypt from "bcryptjs";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { MediaClient } from "@lms/medias";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
@Injectable()
export class AppService {
  constructor(
    @Inject("COURSES_SERVICE") private readonly coursesclient: ClientProxy,
    @Inject("NOTIFICATION_SERVICE")
    private readonly notificationclient: ClientProxy,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Students.name)
    private readonly studentModel: Model<StudentsDocument>,
    @InjectModel(Tutors.name)
    private readonly tutorModel: Model<Tutors>,
    private readonly eventemitter: EventEmitter2,
    private readonly media: MediaClient,
  ) {}

  async register(data: IRegister) {
    const { fullname, email, password, role } = data;
    const isexistuser = await this.userModel.findOne({ email });
    if (isexistuser) {
      throw new ConflictException(`User already exist with ${email}.`);
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const profile =
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRt_JtzhU6BiLY_rc1hxdlLoE_Cy8llGKkv-m4zl77LQ&s=10";

    const response = await fetch(profile);
    const buffer = Buffer.from(await response.arrayBuffer());

    const base64 = buffer.toString("base64");
    const url = await this.media.upload(base64, "profile");
    const user = await this.userModel.create({
      fullname,
      email,
      profilepic: url.url,
      role,
      password: hashedpassword,
    });

    if (!user) {
      throw new InternalServerErrorException(
        "Something went wrong in Database.",
      );
    }

    const token = crypto.randomUUID();

    this.redis.set(
      `session-${token}`,
      JSON.stringify({
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        profilepic: user.profilepic,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    this.eventemitter.emit("createprofile", {
      userid: user._id,
      role: user.role,
    });

    this.notificationclient.emit("signupemaail", {
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    });

    return success("User created successfully", {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      profilepic: user.profilepic,
      token,
    });
  }

  @OnEvent("createprofile", { async: true })
  async createprofile(data: { userid: string; role: "tutor" | "student" }) {
    if (data.role == "student") {
      await this.studentModel.create({
        userid: data.userid,
      });
    } else {
      await this.tutorModel.create({
        userid: data.userid,
      });
    }
  }

  async login(data: ILogin) {
    const { email, password } = data;
    const isexistinguser = await this.userModel.findOne({ email });
    if (!isexistinguser) {
      throw new NotFoundException("User not found");
    }

    const decodedpassword = await bcrypt.compare(
      password,
      isexistinguser.password,
    );
    if (!decodedpassword) {
      throw new BadRequestException("Pls provide valid credentials.");
    }

    const token = crypto.randomUUID();

    this.redis.set(
      `session-${token}`,
      JSON.stringify({
        _id: isexistinguser._id,
        fullname: isexistinguser.fullname,
        email: isexistinguser.email,
        role: isexistinguser.role,
        profilepic: isexistinguser.profilepic,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    return {
      data: {
        _id: isexistinguser._id,
        fullname: isexistinguser.fullname,
        email: isexistinguser.email,
        role: isexistinguser.role,
        profilepic: isexistinguser.profilepic,
      },
      token,
    };
  }

  async logout(data: { token: string }) {
    this.redis.del(`session-${data.token}`);
    return {
      success: true,
      message: "Logout successfull.",
    };
  }

  async getprofile(data: { token: string }) {
    const user = await this.redis.get(`session-${data.token}`);
    if (!user) {
      throw new UnauthorizedException("pls login first.");
    }
    return success("user found", JSON.parse(user));
  }

  async updateprofile(data: IUpdateUser) {
    const { fullname, password, profile, token } = data;
    const user = JSON.parse(await this.redis.get(`session-${token}`));
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const dbuser = await this.userModel.findOne({ _id: user._id });
    if (!dbuser) {
      throw new NotFoundException("User not found");
    }

    if (fullname) {
      dbuser.fullname = fullname;
      user.fullname = fullname;
    }

    if (password) {
      const hashedpaswword = await bcrypt.hash(password, 10);
      dbuser.password = hashedpaswword;
    }
    if (profile) {
      const url = await this.media.upload(profile, "profile");
      dbuser.profilepic = url.url;
      user.profilepic = url.url;
    }

    await dbuser.save();
    await this.redis.set(`session-${token}`, JSON.stringify(user), "KEEPTTL");

    this.coursesclient.emit("updateprofile", {
      userid: dbuser._id,
      username: dbuser.fullname,
      role: dbuser.role,
    });

    return success("User updated successfully ", user);
  }

  async updatecertificates(data: ICreateCertificate) {
    const { coursename, tutor, studentid, courseid } = data;
    console.log(data);

    const body = {
      coursename,
      tutor: new Types.ObjectId(tutor),
      studentid: new Types.ObjectId(studentid),
      courseid: new Types.ObjectId(courseid),
    };
    const studentprofile = await this.studentModel.findOne({
      userid: body.studentid,
    });

    if (!studentprofile) {
      throw new NotFoundException("Student not found.");
    }

    const isenrolled = studentprofile.enrolledcourses.find((item) =>
      item.courseid.equals(body.courseid),
    );

    if (!isenrolled) {
      throw new BadRequestException("pls enrolled the course first.");
    }

    const isalreadygotcertifcate = studentprofile.certificates.find((item) =>
      item.courseid.equals(body.courseid),
    );

    if (isalreadygotcertifcate) {
      throw new ConflictException("You have already created a certificate.");
    }

    if (isenrolled.iscompleted) {
      studentprofile.certificates.push({
        coursename,
        tutor: body.tutor,
        courseid: body.courseid,
      });

      await studentprofile.save();
      const user = await this.userModel.findById(studentid)

      this.notificationclient.emit("coursecertificateemail",{
        coursename,
        fullname:user.fullname,
        emai:user.email
      })

      return success("Certifacte added to student profile", studentprofile);
    } else {
      throw new BadRequestException("Pls complete the enrolled course first.");
    }
  }

  async updateenrolledcourse(data: IUpdateEnrolledCourse) {
    const { coursename, tutor, studentid, courseid } = data;
    console.log(data);
    const body = {
      coursename,
      tutor: new Types.ObjectId(tutor),
      studentid: new Types.ObjectId(studentid),
      courseid: new Types.ObjectId(courseid),
    };

    const user = await this.userModel.findById(body.studentid);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const student = await this.studentModel.findOne({ userid: body.studentid });
    if (!student) {
      throw new NotFoundException("Student profile is not found.");
    }
    const isalreadyenrolled = student.enrolledcourses.find((item) =>
      item.courseid.equals(body.courseid),
    );
    if (isalreadyenrolled) {
      throw new ConflictException("You have already enrolled this course .");
    }

    student.enrolledcourses.push({
      coursename: body.coursename,
      courseid: body.courseid,
      tutor: body.tutor,
      iscompleted: false,
    });
    await student.save();

    this.coursesclient.emit("updateenrolled", {
      userid: String(studentid),
      username: String(user.fullname),
      courseid: String(courseid),
    });

    const tutors = await this.userModel.findById(tutor)

    this.notificationclient.emit("courseenrolledemail",{
      fullname:user.fullname,
      coursename,
      email:user.email,
      tutorname:tutors.fullname
    })

    return success("Enrolled to the course", student);
  }

  async UpdateTutorprofile(data: IUpdateTutor) {
    const { acedemics, experience, userid } = data;
    const uu = new Types.ObjectId(userid);
    const tutor = await this.tutorModel.findOne({ userid: uu });
    if (!tutor) {
      throw new NotFoundException("Tutor not found");
    }
    tutor.acedemics = acedemics;
    tutor.experience = experience;
    await tutor.save();

    return success("Tutor profile updated successfully.");
  }

  async verifyTutor(data: IverifyTutor) {
    const tutor = await this.tutorModel.findOne({
      userid: new Types.ObjectId(data.userid),
    });
    if (!tutor) {
      throw new NotFoundException("Tutor not found");
    }

    tutor.isverified = true;
    await tutor.save();
    const user = await this.userModel.findById(data.userid);
    this.notificationclient.emit("verifiedtutoremail", {
      fullname: user.fullname,
      email: user.email,
    });

    return success("Tutor verifies successfully", tutor);
  }

  async makecousecomplete(data: ICompleteCourse) {
    const body = {
      studentid: new Types.ObjectId(data.studentid),
      courseid: new Types.ObjectId(data.courseid),
    };
    const user = await this.userModel.findById(body.studentid);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const student = await this.studentModel.findOne({ userid: body.studentid });
    if (!student) {
      throw new NotFoundException("Student not found");
    }
    const course = student.enrolledcourses.find((data) =>
      data.courseid.equals(body.courseid),
    );
    if (!course) {
      throw new BadRequestException("Pls enrolled the course first.");
    }
    course.iscompleted = true;
    await student.save();

    this.coursesclient.emit("updatecompletion", {
      userid: data.studentid,
      username: user.fullname,
      courseid: data.courseid,
    });
    return success("Course completed");
  }

  async getstudents(data: { tutorid: string }) {
    const std = await firstValueFrom(
      this.coursesclient.send("getstudents", data),
    );
    const students = await Promise.all(
      std.payload.map(async (item) => {
        const user = await this.userModel.findById(item);

        if (!user) return null;

        return {
          username: user.fullname,
          userid: user._id,
        };
      }),
    );

    const final = students.filter((student) => student !== null);
    return success("Found", final);
  }

  async getalltutors(data: { studentid: string }) {
    const user = await this.studentModel.findOne({ userid: data.studentid });
    if (!user) throw new NotFoundException("Student not found");
    const final = user.enrolledcourses.map((data) => data.tutor);
    if (!final.length) {
      throw new NotFoundException("No tutors for chat");
    }
    const tutors = await this.userModel
      .find({ _id: { $in: final } })
      .select("fullname")
      .lean();

    return tutors.map((tutor) => ({
      tutorname: tutor.fullname,
      tutorid: tutor._id,
    }));
  }

  async gettutorstool() {
    const tutors = await this.tutorModel
      .find({})
      .populate("userid")
      .select("fullname");
    if (!tutors.length) return "No tutors found";
    return tutors;
  }

  async getusernotification(data:{userid:string}){

    const user = await this.userModel.findById(data.userid)
    return {
      fullname:user.fullname,
      email:user.email
    }

  }
}
