import { REDIS_CLIENT } from "@lms/redis";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, timingSafeEqual } from "node:crypto";
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
import { DEFAULT_PROFILE_PIC } from "./constants/default-profile-pic";
@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject("COURSES_SERVICE") private readonly coursesclient: ClientProxy,
    @Inject("CHAT_SERVICE") private readonly chatclient: ClientProxy,
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
    private readonly config: ConfigService,
  ) {
    this.validateUnpaidEnrollmentConfig();
  }

  onModuleInit() {
    this.validateUnpaidEnrollmentConfig();
    if (!process.env.ADMIN_EMAIL?.trim() || !process.env.ADMIN_PASSWORD) {
      this.logger.error(
        "Admin login is disabled because ADMIN_EMAIL and/or ADMIN_PASSWORD is not configured.",
      );
    }
  }

  async register(data: IRegister) {
    const { fullname, email, password, role, profilepic } = data;
    if (
      process.env.ADMIN_EMAIL?.trim() &&
      email.trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase()
    ) {
      throw new ConflictException(`User already exist with ${email}.`);
    }
    const isexistuser = await this.userModel.findOne({ email });
    if (isexistuser) {
      throw new ConflictException(`User already exist with ${email}.`);
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      fullname,
      email,
      profilepic: profilepic?.trim() || DEFAULT_PROFILE_PIC,
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

    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (
      adminEmail &&
      this.credentialsMatch(email.trim().toLowerCase(), adminEmail.toLowerCase())
    ) {
      if (!adminPassword) {
        this.logger.error(
          "Admin login was attempted, but ADMIN_PASSWORD is not configured.",
        );
        throw new UnauthorizedException("Invalid credentials.");
      }
      if (
        !this.credentialsMatch(password, adminPassword)
      ) {
        throw new BadRequestException("Pls provide valid credentials.");
      }

      const data = {
        _id: "admin",
        fullname: "Ujyalo Administrator",
        email: adminEmail,
        role: "admin" as const,
        profilepic: "",
      };
      const token = crypto.randomUUID();
      await this.redis.set(
        `session-${token}`,
        JSON.stringify(data),
        "EX",
        7 * 24 * 60 * 60,
      );
      return { data, token };
    }

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

    await this.redis.set(
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

  private credentialsMatch(candidate: string, configured: string) {
    const candidateDigest = createHash("sha256").update(candidate).digest();
    const configuredDigest = createHash("sha256").update(configured).digest();
    return timingSafeEqual(candidateDigest, configuredDigest);
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
    if (user.role === "admin") {
      throw new ForbiddenException(
        "Administrator profile details are managed by the server configuration.",
      );
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
        email:user.email
      })

      return success("Certifacte added to student profile", studentprofile);
    } else {
      throw new BadRequestException("Pls complete the enrolled course first.");
    }
  }

  async updateenrolledcourse(data: IUpdateEnrolledCourse) {
    return this.enrollCourse({
      studentid: data.studentid,
      courseid: data.courseid,
    });
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
    if (tutor.verificationStatus === "rejected") {
      tutor.verificationStatus = "pending";
    }
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
    const decision = data.decision ?? "approve";
    if (decision === "approve" && tutor.isverified) {
      throw new ConflictException("Tutor is already approved.");
    }
    if (decision === "reject" && tutor.isverified) {
      throw new ConflictException("An approved tutor application cannot be rejected.");
    }
    if (decision === "reject" && tutor.verificationStatus === "rejected") {
      throw new ConflictException("Tutor application is already rejected.");
    }

    tutor.isverified = decision === "approve";
    tutor.verificationStatus = decision === "approve" ? "approved" : "rejected";
    await tutor.save();
    if (decision === "approve") {
      const user = await this.userModel.findById(data.userid);
      if (user) {
        this.notificationclient.emit("verifiedtutoremail", {
          fullname: user.fullname,
          email: user.email,
        });
      }
    }

    return success(
      decision === "approve" ? "Tutor approved successfully." : "Tutor application rejected.",
      { userid: data.userid, verificationStatus: tutor.verificationStatus },
    );
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

  async getEnrolledCourses(data: { studentid: string }) {
    if (!Types.ObjectId.isValid(data.studentid)) {
      throw new BadRequestException("Invalid student id.");
    }
    const student = await this.studentModel.findOne({
      userid: new Types.ObjectId(data.studentid),
    });
    if (!student) return success("No enrolled courses", []);

    const courses = await Promise.all(
      student.enrolledcourses.map(async (enrollment) => {
        const result = await firstValueFrom(
          this.coursesclient.send<{
            success: boolean;
            payload?: Record<string, unknown> & {
              _id: string;
              tutor: {
                tutorid: string;
                tutorname: string;
                [key: string]: unknown;
              };
            };
          }>("getcoursebyid", { courseid: String(enrollment.courseid) }),
        );
        if (!result?.success || !result.payload) {
          throw new NotFoundException("An enrolled course could not be found.");
        }
        const tutorId = result.payload.tutor.tutorid;
        const tutor = await this.userModel
          .findById(tutorId)
          .select("profilepic")
          .lean();
        return {
          ...result.payload,
          tutor: {
            ...result.payload.tutor,
            profilepic: tutor?.profilepic ?? "",
          },
          iscompleted: enrollment.iscompleted,
          enrollmentSource:
            enrollment.enrollmentSource ??
            (Number(result.payload.price) > 0 ? "payment" : "free"),
          isDevelopmentEnrollment: enrollment.enrollmentSource === "development",
        };
      }),
    );
    return success("Enrolled courses found", courses);
  }

  async enrollCourse(data: {
    studentid: string;
    courseid: string;
    paymentVerified?: boolean;
    developmentBypass?: boolean;
  }) {
    if (!Types.ObjectId.isValid(data.studentid)) {
      throw new BadRequestException("Invalid student id.");
    }
    const user = await this.userModel.findById(data.studentid);
    if (!user || user.role !== "student") {
      throw new ForbiddenException("A student account is required.");
    }
    const result = await firstValueFrom(
      this.coursesclient.send<{
        success: boolean;
        payload?: {
          _id: string;
          coursename: string;
          price: number;
          isverified: boolean;
          tutor: { tutorid: string; tutorname: string };
        };
      }>("getcoursebyid", { courseid: data.courseid }),
    );
    const course = result?.payload;
    if (!result?.success || !course) throw new NotFoundException("Course not found.");
    if (!course.isverified) throw new BadRequestException("This course is not available for enrollment.");
    if (!Number.isFinite(course.price) || course.price < 0) {
      throw new BadRequestException("The course price is invalid.");
    }
    const isPaidCourse = course.price > 0;
    const developmentEnrollment =
      isPaidCourse && !data.paymentVerified && data.developmentBypass === true;
    if (
      isPaidCourse &&
      !data.paymentVerified &&
      (!developmentEnrollment || !this.allowUnpaidEnrollment())
    ) {
      throw new BadRequestException("Payment confirmation is required before enrolling in a paid course.");
    }
    const enrollmentSource = isPaidCourse
      ? developmentEnrollment
        ? "development"
        : "payment"
      : "free";

    const studentid = new Types.ObjectId(data.studentid);
    const courseid = new Types.ObjectId(course._id);
    const student = await this.studentModel.findOneAndUpdate(
      {
        userid: studentid,
        "enrolledcourses.courseid": { $ne: courseid },
      },
      {
        $push: {
          enrolledcourses: {
            coursename: course.coursename,
            courseid,
            tutor: new Types.ObjectId(course.tutor.tutorid),
            iscompleted: false,
            enrollmentSource,
          },
        },
      },
      { new: true },
    );
    if (!student) {
      const existingStudent = await this.studentModel.findOne({ userid: studentid });
      if (!existingStudent) throw new NotFoundException("Student profile is not ready.");
      const existingEnrollment = existingStudent.enrolledcourses.find((item) =>
        item.courseid.equals(courseid),
      );
      if (existingEnrollment) {
        if (data.paymentVerified && isPaidCourse) {
          await this.studentModel.updateOne(
            { userid: studentid, "enrolledcourses.courseid": courseid },
            { $set: { "enrolledcourses.$.enrollmentSource": "payment" } },
          );
          existingEnrollment.enrollmentSource = "payment";
        }
        const existingSource =
          existingEnrollment.enrollmentSource ??
          (isPaidCourse ? "payment" : "free");
        if (existingSource !== "development" || this.allowUnpaidEnrollment()) {
          this.chatclient.emit("chat.ensureEnrollmentConversation", {
            studentId: String(user._id),
            instructorId: course.tutor.tutorid,
            courseIds: [course._id],
          });
        }
        return success("You are already enrolled in this course.", {
          courseid: course._id,
          enrollmentSource: existingSource,
          isDevelopmentEnrollment: existingSource === "development",
        });
      }
      throw new InternalServerErrorException("Course enrollment could not be saved.");
    }

    this.coursesclient.emit("updateenrolled", {
      userid: String(user._id),
      username: user.fullname,
      courseid: course._id,
    });
    this.notificationclient.emit("courseenrolledemail", {
      fullname: user.fullname,
      coursename: course.coursename,
      email: user.email,
      tutorname: course.tutor.tutorname,
    });
    if (enrollmentSource !== "development" || this.allowUnpaidEnrollment()) {
      this.chatclient.emit("chat.ensureEnrollmentConversation", {
        studentId: String(user._id),
        instructorId: course.tutor.tutorid,
        courseIds: [course._id],
      });
    }
    return success("Enrolled to the course", {
      courseid: course._id,
      enrollmentSource,
      isDevelopmentEnrollment: enrollmentSource === "development",
    });
  }

  private allowUnpaidEnrollment() {
    return this.config.get<string>("ALLOW_UNPAID_ENROLLMENT")?.trim().toLowerCase() === "true";
  }

  private validateUnpaidEnrollmentConfig() {
    const setting = this.config
      .get<string>("ALLOW_UNPAID_ENROLLMENT")
      ?.trim()
      .toLowerCase();
    if (!setting || setting === "false") return;
    if (setting !== "true") {
      throw new InternalServerErrorException(
        "ALLOW_UNPAID_ENROLLMENT must be set to true or false.",
      );
    }
    if (this.config.get<string>("NODE_ENV") !== "development") {
      throw new InternalServerErrorException(
        "ALLOW_UNPAID_ENROLLMENT=true is only permitted when NODE_ENV=development.",
      );
    }
  }

  async completeEnrolledCourse(data: { studentid: string; courseid: string }) {
    if (!Types.ObjectId.isValid(data.studentid)) {
      throw new BadRequestException("Invalid student id.");
    }
    const user = await this.userModel.findById(data.studentid);
    if (!user || user.role !== "student") {
      throw new ForbiddenException("A student account is required.");
    }
    const courseResult = await firstValueFrom(
      this.coursesclient.send<{
        success: boolean;
        payload?: { _id: string; providecompletionoption: boolean };
      }>("getcoursebyid", { courseid: data.courseid }),
    );
    const course = courseResult?.payload;
    if (!courseResult?.success || !course) throw new NotFoundException("Course not found.");
    if (!course.providecompletionoption) {
      throw new BadRequestException("This course does not currently allow completion.");
    }
    const student = await this.studentModel.findOne({
      userid: new Types.ObjectId(data.studentid),
    });
    if (!student) throw new NotFoundException("Student profile not found.");
    const enrollment = student.enrolledcourses.find((item) =>
      item.courseid.equals(course._id),
    );
    if (!enrollment) throw new BadRequestException("Enroll in this course first.");
    if (enrollment.iscompleted) return success("Course is already completed.");

    enrollment.iscompleted = true;
    await student.save();
    this.coursesclient.emit("updatecompletion", {
      userid: data.studentid,
      username: user.fullname,
      courseid: data.courseid,
    });
    return success("Course completed");
  }

  async getCertificates(data: { studentid: string }) {
    if (!Types.ObjectId.isValid(data.studentid)) {
      throw new BadRequestException("Invalid student id.");
    }
    const student = await this.studentModel.findOne({
      userid: new Types.ObjectId(data.studentid),
    });
    if (!student) return success("No certificates found", []);
    return success("Certificates found", student.certificates);
  }

  async getTutorProfile(data: { userid: string }) {
    if (!Types.ObjectId.isValid(data.userid)) {
      throw new BadRequestException("Invalid tutor id.");
    }
    const [tutor, user] = await Promise.all([
      this.tutorModel.findOne({ userid: new Types.ObjectId(data.userid) }),
      this.userModel.findById(data.userid).select("fullname profilepic role"),
    ]);
    if (!tutor || !user || user.role !== "tutor") {
      throw new NotFoundException("Tutor profile not found.");
    }
    return success("Tutor profile found", {
      userid: String(user._id),
      fullname: user.fullname,
      profilepic: user.profilepic,
      acedemics: tutor.acedemics,
      experience: tutor.experience,
      isverified: tutor.isverified,
      verificationStatus:
        tutor.verificationStatus ?? (tutor.isverified ? "approved" : "pending"),
      certificates: tutor.certificates ?? [],
    });
  }

  async getPendingTutors() {
    const tutors = await this.tutorModel
      .find({
        isverified: { $ne: true },
        verificationStatus: { $ne: "rejected" },
      })
      .lean();
    const users = await this.userModel
      .find({
        _id: { $in: tutors.map((tutor) => tutor.userid) },
        role: "tutor",
      })
      .select("fullname email profilepic")
      .lean();
    const usersById = new Map(users.map((user) => [String(user._id), user]));
    return success(
      "Pending tutors found.",
      tutors.flatMap((tutor) => {
        const user = usersById.get(String(tutor.userid));
        if (!user) return [];
        return [{
          userid: String(user._id),
          fullname: user.fullname,
          email: user.email,
          profilepic: user.profilepic,
          acedemics: tutor.acedemics ?? "",
          experience: tutor.experience ?? "",
          certificates: tutor.certificates ?? [],
          verificationStatus: tutor.verificationStatus ?? "pending",
        }];
      }),
    );
  }

  async getPublicUserProfiles(data: { userids: string[] }) {
    const userids = [...new Set(data.userids)].filter((id) =>
      Types.ObjectId.isValid(id),
    );
    const users = await this.userModel
      .find({ _id: { $in: userids }, role: "tutor" })
      .select("fullname profilepic")
      .lean();
    return success(
      "Tutor profiles found.",
      users.map((user) => ({
        userid: String(user._id),
        fullname: user.fullname,
        profilepic: user.profilepic,
      })),
    );
  }

  async getChatParticipants(data: { userids: string[] }) {
    if (!Array.isArray(data.userids) || data.userids.length > 500) {
      throw new BadRequestException("Invalid chat participant query.");
    }
    const userids = [...new Set(data.userids)].filter((id) =>
      Types.ObjectId.isValid(id),
    );
    if (!userids.length) return success("Chat participants found.", []);

    const [users, students] = await Promise.all([
      this.userModel
        .find({ _id: { $in: userids }, role: "student" })
        .select("fullname profilepic")
        .lean(),
      this.studentModel
        .find({ userid: { $in: userids } })
        .select("userid enrolledcourses")
        .lean(),
    ]);
    const studentsById = new Map(
      students.map((student) => [String(student.userid), student]),
    );
    return success(
      "Chat participants found.",
      users.flatMap((user) => {
        const student = studentsById.get(String(user._id));
        if (!student) return [];
        return [
          {
            userid: String(user._id),
            fullname: user.fullname,
            profilepic: user.profilepic,
            enrolledCourses: student.enrolledcourses.map((enrollment) => ({
              courseid: String(enrollment.courseid),
              coursename: enrollment.coursename,
            })),
          },
        ];
      }),
    );
  }

  async getEligibleStudentsForTutor(data: {
    tutorid: string;
    courseids: string[];
  }) {
    if (
      !Types.ObjectId.isValid(data.tutorid) ||
      !Array.isArray(data.courseids) ||
      data.courseids.some((courseid) => !Types.ObjectId.isValid(courseid))
    ) {
      throw new BadRequestException("Invalid eligible chat student query.");
    }
    const tutorid = new Types.ObjectId(data.tutorid);
    const courseids = [...new Set(data.courseids)].map(
      (courseid) => new Types.ObjectId(courseid),
    );
    if (!courseids.length) return success("Eligible chat students found.", []);

    const enrolledCourseFilter: Record<string, unknown> = {
      tutor: tutorid,
      courseid: { $in: courseids },
    };
    if (!this.allowUnpaidEnrollment()) {
      enrolledCourseFilter.enrollmentSource = { $ne: "development" };
    }
    const studentProfiles = await this.studentModel
      .find({
        enrolledcourses: { $elemMatch: enrolledCourseFilter },
      })
      .select("userid enrolledcourses")
      .lean();
    if (!studentProfiles.length) {
      return success("Eligible chat students found.", []);
    }

    const userids = studentProfiles.map((student) => student.userid);
    const users = await this.userModel
      .find({ _id: { $in: userids }, role: "student" })
      .select("fullname profilepic")
      .lean();
    const usersById = new Map(users.map((user) => [String(user._id), user]));
    const eligibleCourseIds = new Set(courseids.map(String));
    const students = studentProfiles.flatMap((student) => {
      const userid = String(student.userid);
      const user = usersById.get(userid);
      if (!user) return [];
      const enrolledCourses = student.enrolledcourses
        .filter(
          (enrollment) =>
            String(enrollment.tutor) === String(tutorid) &&
            eligibleCourseIds.has(String(enrollment.courseid)) &&
            (enrollment.enrollmentSource !== "development" ||
              this.allowUnpaidEnrollment()),
        )
        .map((enrollment) => ({
          courseid: String(enrollment.courseid),
          coursename: enrollment.coursename,
        }));
      if (!enrolledCourses.length) return [];
      return [
        {
          userid,
          fullname: user.fullname,
          profilepic: user.profilepic,
          enrolledCourses,
        },
      ];
    });
    return success("Eligible chat students found.", students);
  }

  async getstudents(data: { tutorid: string }) {
    const std = await firstValueFrom(
      this.coursesclient.send("getstudents", data),
    );
    const students = await Promise.all(
      std.payload.map(async (item) => {
        const user = await this.userModel.findById(item.userid);

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
