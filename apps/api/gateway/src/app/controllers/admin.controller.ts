import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { AuthReq } from "@lms/shared";
import { firstValueFrom, timeout } from "rxjs";
import { instrumentRmqClient } from "@lms/filters";
import { AuthGuard } from "../guards/auth.guard";

interface SessionProfile {
  role: "student" | "tutor" | "admin";
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  payload?: T;
}

interface PendingTutor {
  userid: string;
  fullname: string;
  email: string;
  profilepic: string;
  acedemics: string;
  experience: string;
  certificates: string[];
  verificationStatus: "pending" | "approved" | "rejected";
}

@Controller("admin")
@UseGuards(AuthGuard)
export class AdminController {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
    @Inject("COURSES_SERVICE") private readonly coursesClient: ClientProxy,
  ) {
    this.usersClient = instrumentRmqClient(this.usersClient, "users");
    this.coursesClient = instrumentRmqClient(this.coursesClient, "courses");
  }

  @Get("courses/pending")
  async pendingCourses(@Req() req: AuthReq) {
    await this.requireAdmin(req.user);
    return firstValueFrom(
      this.coursesClient.send("getpendingcourses", {}).pipe(timeout(10000)),
    );
  }

  @Get("tutors/pending")
  async pendingTutors(@Req() req: AuthReq) {
    await this.requireAdmin(req.user);
    return firstValueFrom(
      this.usersClient.send<ApiEnvelope<PendingTutor[]>>("getpendingtutors", {}).pipe(timeout(10000)),
    );
  }

  @Post("tutors/:userid/approve")
  async approveTutor(@Param("userid") userid: string, @Req() req: AuthReq) {
    await this.requireAdmin(req.user);
    this.validateUserId(userid);
    return firstValueFrom(
      this.usersClient
        .send("verifytutor", { userid, decision: "approve" })
        .pipe(timeout(15000)),
    );
  }

  @Post("tutors/:userid/reject")
  async rejectTutor(@Param("userid") userid: string, @Req() req: AuthReq) {
    await this.requireAdmin(req.user);
    this.validateUserId(userid);
    return firstValueFrom(
      this.usersClient
        .send("verifytutor", { userid, decision: "reject" })
        .pipe(timeout(15000)),
    );
  }

  @Post("courses/:courseid/approve")
  async approveCourse(@Param("courseid") courseid: string, @Req() req: AuthReq) {
    await this.requireAdmin(req.user);
    if (!/^[a-f\d]{24}$/i.test(courseid)) {
      throw new BadRequestException("Invalid course id.");
    }

    return firstValueFrom(
      this.coursesClient
        .send("verifycourse", { courseid, verify: true })
        .pipe(timeout(15000)),
    );
  }

  private async requireAdmin(token: string) {
    const result = await firstValueFrom(
      this.usersClient
        .send<ApiEnvelope<SessionProfile>>("getprofile", { token })
        .pipe(timeout(8000)),
    );
    if (!result?.success || !result.payload) {
      throw new UnauthorizedException("Your session is no longer valid.");
    }
    if (result.payload.role !== "admin") {
      throw new ForbiddenException("An admin account is required.");
    }
  }

  private validateUserId(userid: string) {
    if (!/^[a-f\d]{24}$/i.test(userid)) {
      throw new BadRequestException("Invalid user id.");
    }
  }
}
