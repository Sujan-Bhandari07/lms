import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { AuthReq, EnrollCourseDto, UpdateTutorProfileDto } from "@lms/shared";
import { firstValueFrom, timeout } from "rxjs";
import { instrumentRmqClient } from "@lms/filters";
import { AuthGuard } from "../guards/auth.guard";

interface SessionProfile {
  _id: string;
  fullname: string;
  email: string;
  role: "student" | "tutor" | "admin";
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  payload?: T;
}

interface CourseRecord {
  _id: string;
  coursename: string;
  tutor: { tutorid: string };
}

@Controller("users")
@UseGuards(AuthGuard)
export class LearningController {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
    @Inject("COURSES_SERVICE") private readonly coursesClient: ClientProxy,
  ) {
    this.usersClient = instrumentRmqClient(this.usersClient, "users");
    this.coursesClient = instrumentRmqClient(this.coursesClient, "courses");
  }

  @Get("enrollments")
  async enrollments(@Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    return firstValueFrom(
      this.usersClient.send("getenrolledcourses", { studentid: profile._id }).pipe(timeout(15000)),
    );
  }

  @Post("enrollments")
  async enroll(@Body() data: EnrollCourseDto, @Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    return firstValueFrom(
      this.usersClient.send("enrollcourse", {
        studentid: profile._id,
        courseid: data.courseid,
      }).pipe(timeout(15000)),
    );
  }

  @Post("enrollments/:courseid/complete")
  async complete(@Param("courseid") courseid: string, @Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    return firstValueFrom(
      this.usersClient.send("completeenrolledcourse", {
        studentid: profile._id,
        courseid,
      }).pipe(timeout(15000)),
    );
  }

  @Get("certificates")
  async certificates(@Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    return firstValueFrom(
      this.usersClient.send("getcertificates", { studentid: profile._id }).pipe(timeout(8000)),
    );
  }

  @Post("certificates")
  async createCertificate(@Body() data: EnrollCourseDto, @Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    const course = await firstValueFrom(
      this.coursesClient.send<ApiEnvelope<CourseRecord>>("getcoursebyid", { courseid: data.courseid }).pipe(timeout(8000)),
    );
    if (!course?.success || !course.payload) {
      throw new UnauthorizedException("The enrolled course could not be found.");
    }

    return firstValueFrom(
      this.usersClient.send("updatecertificate", {
        coursename: course.payload.coursename,
        tutor: course.payload.tutor.tutorid,
        courseid: course.payload._id,
        studentid: profile._id,
      }).pipe(timeout(15000)),
    );
  }

  @Get("tutorprofile")
  async tutorProfile(@Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireTutor(profile);
    return firstValueFrom(
      this.usersClient.send("gettutorprofile", { userid: profile._id }).pipe(timeout(8000)),
    );
  }

  @Patch("tutorprofile")
  async updateTutorProfile(@Body() data: UpdateTutorProfileDto, @Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireTutor(profile);
    return firstValueFrom(
      this.usersClient.send("updatetutorprofile", {
        userid: profile._id,
        acedemics: data.acedemics,
        experience: data.experience,
      }).pipe(timeout(10000)),
    );
  }

  @Get("tutor/students")
  async tutorStudents(@Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireTutor(profile);
    return firstValueFrom(
      this.usersClient.send("getstudents", { tutorid: profile._id }).pipe(timeout(10000)),
    );
  }

  private async sessionProfile(token: string): Promise<SessionProfile> {
    const result = await firstValueFrom(
      this.usersClient.send<ApiEnvelope<SessionProfile>>("getprofile", { token }).pipe(timeout(8000)),
    );
    if (!result?.success || !result.payload) throw new UnauthorizedException("Your session is no longer valid.");
    return result.payload;
  }

  private requireStudent(profile: SessionProfile) {
    if (profile.role !== "student") throw new ForbiddenException("A student account is required.");
  }

  private requireTutor(profile: SessionProfile) {
    if (profile.role !== "tutor") throw new ForbiddenException("A tutor account is required.");
  }
}
