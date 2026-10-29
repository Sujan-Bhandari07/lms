import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ClientProxy } from "@nestjs/microservices";
import {
  AuthReq,
  CreateCourseCommentDto,
  CreateCourseRatingDto,
  GCreateCourseDto,
  GUploadPartDto,
  PublicCoursesQueryDto,
  UpdateCourseDto,
} from "@lms/shared";
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

interface CourseTutor {
  tutorid: string;
  tutorname: string;
  profilepic?: string;
}

interface PublicCourse {
  _id: string;
  tutor: CourseTutor;
}

interface PublicCoursePage {
  items: PublicCourse[];
  [key: string]: unknown;
}

@Controller("courses/catalog")
export class CourseCatalogController {
  constructor(
    @Inject("COURSES_SERVICE") private readonly coursesClient: ClientProxy,
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
  ) {
    this.coursesClient = instrumentRmqClient(this.coursesClient, "courses");
    this.usersClient = instrumentRmqClient(this.usersClient, "users");
  }

  @Get()
  async list(@Query() query: PublicCoursesQueryDto) {
    const result = await firstValueFrom(
      this.coursesClient
        .send<ApiEnvelope<PublicCoursePage>>("getpubliccourses", query)
        .pipe(timeout(8000)),
    );
    if (!result?.success || !result.payload?.items) return result;
    const profiles = await this.tutorProfiles(
      result.payload.items.map((course: PublicCourse) => course.tutor.tutorid),
    );
    return {
      ...result,
      payload: {
        ...result.payload,
        items: result.payload.items.map((course: PublicCourse) => ({
          ...course,
          tutor: {
            ...course.tutor,
            profilepic: profiles.get(course.tutor.tutorid) ?? "",
          },
        })),
      },
    };
  }

  @Get("manage")
  @UseGuards(AuthGuard)
  async ownCourses(@Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireTutor(profile);
    return firstValueFrom(
      this.coursesClient.send("getcoursesbytutor", {
        tutorid: profile._id,
        tutorname: profile.fullname,
      }).pipe(timeout(10000)),
    );
  }

  @Get(":courseid")
  async get(@Param("courseid") courseid: string) {
    const result = await firstValueFrom(
      this.coursesClient
        .send<ApiEnvelope<PublicCourse>>("getpubliccoursebyid", { courseid })
        .pipe(timeout(8000)),
    );
    if (!result?.success || !result.payload) return result;
    const course = result.payload;
    const profiles = await this.tutorProfiles([course.tutor.tutorid]);
    return {
      ...result,
      payload: {
        ...course,
        tutor: {
          ...course.tutor,
          profilepic: profiles.get(course.tutor.tutorid) ?? "",
        },
      },
    };
  }

  @Post("manage")
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor("photo", {
      limits: { fileSize: 500 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        file.mimetype.startsWith("image/")
          ? cb(null, true)
          : cb(new BadRequestException("Only image files are allowed"), false),
    }),
  )
  async create(
    @Body() data: GCreateCourseDto,
    @UploadedFile() photo: Express.Multer.File,
    @Req() req: AuthReq,
  ) {
    if (!photo) throw new BadRequestException("Course photo is required.");
    const profile = await this.sessionProfile(req.user);
    this.requireTutor(profile);

    return firstValueFrom(
      this.coursesClient.send("createcourse", {
        ...data,
        title: photo.buffer.toString("base64"),
        tutor: { tutorid: profile._id, tutorname: profile.fullname },
      }).pipe(timeout(15000)),
    );
  }

  @Patch("manage/:courseid")
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor("photo", {
      limits: { fileSize: 500 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        file.mimetype.startsWith("image/")
          ? cb(null, true)
          : cb(new BadRequestException("Only image files are allowed"), false),
    }),
  )
  async update(
    @Param("courseid") courseid: string,
    @Body() data: UpdateCourseDto,
    @UploadedFile() photo: Express.Multer.File | undefined,
    @Req() req: AuthReq,
  ) {
    const profile = await this.sessionProfile(req.user);
    this.requireTutor(profile);
    await this.requireOwnership(profile, courseid);

    return firstValueFrom(
      this.coursesClient.send("updateownedcourse", {
        courseid,
        ...data,
        ...(photo && { photo: photo.buffer.toString("base64") }),
      }).pipe(timeout(15000)),
    );
  }

  @Post("manage/:courseid/parts")
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor("part", {
      limits: { fileSize: 500 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        file.mimetype.startsWith("video/")
          ? cb(null, true)
          : cb(new BadRequestException("Only video files are allowed"), false),
    }),
  )
  async uploadPart(
    @Param("courseid") courseid: string,
    @Body() data: GUploadPartDto,
    @UploadedFile() part: Express.Multer.File | undefined,
    @Req() req: AuthReq,
  ) {
    if (!part) throw new BadRequestException("A video file is required.");
    if (data.courseid !== courseid) throw new BadRequestException("Course id does not match the route.");
    const profile = await this.sessionProfile(req.user);
    this.requireTutor(profile);
    await this.requireOwnership(profile, courseid);

    return firstValueFrom(
      this.coursesClient.send("uploadpart", {
        courseid,
        title: data.title,
        partdesc: data.partdesc,
        videourl: part.buffer.toString("base64"),
      }).pipe(timeout(30000)),
    );
  }

  @Post("manage/:courseid/completion-option")
  @UseGuards(AuthGuard)
  async toggleCompletionOption(@Param("courseid") courseid: string, @Req() req: AuthReq) {
    const profile = await this.sessionProfile(req.user);
    this.requireTutor(profile);
    await this.requireOwnership(profile, courseid);

    return firstValueFrom(
      this.coursesClient.send("providecompletionoption", { courseid }).pipe(timeout(8000)),
    );
  }

  @Post(":courseid/comments")
  @UseGuards(AuthGuard)
  async comment(
    @Param("courseid") courseid: string,
    @Body() data: CreateCourseCommentDto,
    @Req() req: AuthReq,
  ) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    await this.requireEnrollment(profile, courseid);
    return firstValueFrom(
      this.coursesClient.send("sendcomment", {
        courseid,
        comment: data.comment.trim(),
        studentname: profile.fullname,
      }).pipe(timeout(10000)),
    );
  }

  @Post(":courseid/ratings")
  @UseGuards(AuthGuard)
  async rate(
    @Param("courseid") courseid: string,
    @Body() data: CreateCourseRatingDto,
    @Req() req: AuthReq,
  ) {
    const profile = await this.sessionProfile(req.user);
    this.requireStudent(profile);
    await this.requireEnrollment(profile, courseid);
    return firstValueFrom(
      this.coursesClient.send("sendrating", {
        courseid,
        rating: data.rating,
        studentname: profile.fullname,
      }).pipe(timeout(10000)),
    );
  }

  private async sessionProfile(token: string): Promise<SessionProfile> {
    const result = await firstValueFrom(
      this.usersClient.send<ApiEnvelope<SessionProfile>>("getprofile", { token }).pipe(timeout(8000)),
    );
    if (!result?.success || !result.payload) throw new UnauthorizedException("Your session is no longer valid.");
    return result.payload;
  }

  private requireTutor(profile: SessionProfile) {
    if (profile.role !== "tutor") throw new ForbiddenException("A tutor account is required.");
  }

  private async requireOwnership(profile: SessionProfile, courseid: string) {
    const result = await firstValueFrom(
      this.coursesClient.send<ApiEnvelope<{ _id: string }[]>>("getcoursesbytutor", {
        tutorid: profile._id,
        tutorname: profile.fullname,
      }).pipe(timeout(8000)),
    );
    if (!result?.success || !result.payload?.some((course) => course._id === courseid)) {
      throw new ForbiddenException("You can only manage your own courses.");
    }
  }

  private async requireEnrollment(profile: SessionProfile, courseid: string) {
      const result = await firstValueFrom(
        this.usersClient.send<ApiEnvelope<{ _id: string }[]>>("getenrolledcourses", {
          studentid: profile._id,
        }).pipe(timeout(10000)),
      );
      if (!result?.success || !result.payload?.some((course) => course._id === courseid)) {
        throw new ForbiddenException("Enroll in this course before posting a review.");
      }
    }

    private requireStudent(profile: SessionProfile) {
      if (profile.role !== "student") throw new ForbiddenException("A student account is required.");
    }

    private async tutorProfiles(userids: string[]) {
      const uniqueIds = [...new Set(userids)];
      if (!uniqueIds.length) return new Map<string, string>();
      const result = await firstValueFrom(
        this.usersClient
          .send<ApiEnvelope<{ userid: string; profilepic: string }[]>>(
            "getpublicuserprofiles",
            { userids: uniqueIds },
          )
          .pipe(timeout(8000)),
      );
      if (!result?.success || !result.payload) {
        throw new BadGatewayException("Tutor profile images could not be loaded.");
      }
      return new Map(result.payload.map((profile) => [profile.userid, profile.profilepic]));
    }
}
