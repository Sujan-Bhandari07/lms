import {
  AuthReq,
  UCreateCerticateDto,
  UMakeCourseCompletedDto,
  UUpdateEnrolledCourseDto,
  UUpdateTutorDto,
  GUpdateUserDto,
  LoginDto,
  RegisterDto,
  VerifyTutorDto,
  GetAllStudentsDto,
} from "@lms/shared";
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ClientProxy } from "@nestjs/microservices";
import type { CookieOptions, Request, Response } from "express";
import { firstValueFrom } from "rxjs";
import { instrumentRmqClient } from "@lms/filters";
import { AuthGuard } from "../guards/auth.guard";
import { Throttle } from "@nestjs/throttler";

interface SessionProfile {
  _id: string;
  role: "student" | "tutor" | "admin";
}

interface ApiEnvelope<T> {
  success: boolean;
  payload?: T;
}

@Controller("users")
export class UsersController {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
  ) {
    this.usersClient = instrumentRmqClient(this.usersClient, "users");
  }
  @Post("register")
  @Throttle({
    default:{
      limit:100,
      ttl:5 * 60 * 1000,
    }
  })
  async createuser(
    @Body() data: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await firstValueFrom(
      this.usersClient.send("register", {
        ...data,
        profilepic: data.profilepic ?? "",
      }),
    );
    res.cookie("token", response.payload.token, this.sessionCookieOptions());
    return {
      success: true,
      message: response.message,
      payload: {
        _id: response.payload._id,
        fullname: response.payload.fullname,
        email: response.payload.email,
        role: response.payload.role,
        profilepic: response.payload.profilepic,
      },
    };
  }

  @Post("login")
    @Throttle({
    default:{
      limit:100,
      ttl:5 * 60 * 1000,
    }
  })
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await firstValueFrom(this.usersClient.send("login", data));
    res.cookie("token", result.token, this.sessionCookieOptions());

    return {
      success: true,
      message: "Login successfull.",
      payload: {
        _id: result.data._id,
        fullname: result.data.fullname,
        email: result.data.email,
        role: result.data.role,
        profilepic: result.data.profilepic,
      },
    };
  }

  @Post("logout")
  async logout(@Res({passthrough:true}) res: Response, @Req() req: Request) {
    const { token } = req.cookies;
    if (!token) {
      throw new UnauthorizedException("Already been logout.");
    }
    const result = await firstValueFrom(
      this.usersClient.send("logout", { token }),
    );
    if (result.success) {
      res.clearCookie("token", { path: "/" });
      return {
        message: result.message,
      };
    }
  }

  @Get("getprofile")
  @UseGuards(AuthGuard)
  async getprofile(@Req() req: AuthReq) {
    const token = req.user;
    return firstValueFrom(this.usersClient.send("getprofile", { token }));
  }

  @Post("updateprofile")
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor("profile", {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        file.mimetype.startsWith("image/")
          ? cb(null, true)
          : cb(new BadRequestException("Only image files are allowed"), false),
    }),
  )
  async updateprofile(
    @Body() data: GUpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthReq,
  ) {
    const token = req.user;
    const buffer = file?.buffer.toString("base64");

    return firstValueFrom(
      this.usersClient.send("updateprofile", {
        ...data,
        token,
        ...(buffer && { profile: buffer }),
      }),
    );
  }

  @Post("updateenrolledcourse")
  @UseGuards(AuthGuard)
  async updatecourse(@Body() data: UUpdateEnrolledCourseDto, @Req() req: AuthReq) {
    const profile = await this.requireRole(req.user, "student");
    return firstValueFrom(
      this.usersClient.send("enrollcourse", {
        studentid: profile._id,
        courseid: data.courseid,
      }),
    );
  }


 @Post("updatecertificate")
  @UseGuards(AuthGuard)
  async updatecertificate(@Body() data: UCreateCerticateDto, @Req() req: AuthReq) {
    await this.requireRole(req.user, "student");
    return firstValueFrom(
      this.usersClient.send("updatecertificate",data),
    );
  }




  @Post("updatetutorprofile")
  @UseGuards(AuthGuard)
  async updatetutorprofile(@Body() data: UUpdateTutorDto, @Req() req: AuthReq) {
    await this.requireRole(req.user, "tutor");
    return firstValueFrom(
      this.usersClient.send("updatetutorprofile",data),
    );
  }


    @Post("verifytutor")
  @UseGuards(AuthGuard)
  async verifytutor( @Body() data:VerifyTutorDto, @Req() req: AuthReq) {
  await this.requireRole(req.user, "admin");
    return firstValueFrom(
      this.usersClient.send("verifytutor", data),
    );
  }

  @Post("toggleiscompleted")
  @UseGuards(AuthGuard)
  async toggleiscompleted( @Body() data:UMakeCourseCompletedDto, @Req() req: AuthReq) {
    await this.requireRole(req.user, "student");
    return firstValueFrom(
      this.usersClient.send("toggleiscompleted",data),
    );
  }


   @Post("getstudents")
 @UseGuards(AuthGuard)
 async getstudents(@Body() data:GetAllStudentsDto, @Req() req: AuthReq){
await this.requireRole(req.user, "tutor");
return firstValueFrom(this.usersClient.send("getstudents",data))
 }



   @Post("getalltutors")
 @UseGuards(AuthGuard)
 async getalltutors(@Body() data:GetAllStudentsDto, @Req() req: AuthReq){
await this.requireUserRole(req.user);
return firstValueFrom(this.usersClient.send("getalltutors",data))
 }

  private async requireRole(token: string, role: SessionProfile["role"]) {
    const profile = await this.sessionProfile(token);
    if (profile.role !== role) {
      throw new ForbiddenException(`A ${role} account is required.`);
    }
    return profile;
  }

  private async requireUserRole(token: string) {
    const profile = await this.sessionProfile(token);
    if (profile.role === "admin") {
      throw new ForbiddenException("A student or tutor account is required.");
    }
  }

  private async sessionProfile(token: string): Promise<SessionProfile> {
    const result = await firstValueFrom(
      this.usersClient.send<ApiEnvelope<SessionProfile>>("getprofile", { token }),
    );
    if (!result?.success || !result.payload) {
      throw new UnauthorizedException("Your session is no longer valid.");
    }
    return result.payload;
  }

  private sessionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }
}
