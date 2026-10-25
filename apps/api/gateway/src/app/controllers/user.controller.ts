import {
  AuthReq,
  GCreateCerticateDto,
  GMakeCourseCompletedDto,
  GUpdateEnrolledCourseDto,
  GUpdateTutorDto,
  GUpdateUserDto,
  LoginDto,
  RegisterDto,
} from "@lms/shared";
import {
  BadRequestException,
  Body,
  Controller,
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
import type { Request, Response } from "express";
import { firstValueFrom } from "rxjs";
import { AuthGuard } from "../guards/auth.guard";

@Controller("users")
export class UsersController {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
  ) {}
  @Post("register")
  async createuser(
    @Body() data: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await firstValueFrom(
      this.usersClient.send("register", data),
    );
    res.cookie("token", response.payload.token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
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
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await firstValueFrom(this.usersClient.send("login", data));
    res.cookie("token", result.token, { maxAge: 7 * 24 * 60 * 60 * 1000 });

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
  async logout(@Res() res: Response, @Req() req: Request) {
    const { token } = req.cookies;
    if (!token) {
      throw new UnauthorizedException("Already been logout.");
    }
    const result = await firstValueFrom(
      this.usersClient.send("logout", { token }),
    );
    if (result.success) {
      res.clearCookie("token");
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
  updatecourse(@Body() data: GUpdateEnrolledCourseDto, @Req() req: AuthReq) {
    return firstValueFrom(
      this.usersClient.send("updateenrolledcourse", {
        ...data,
        studentid: req.user,
      }),
    );
  }


 @Post("updatecertificate")
  @UseGuards(AuthGuard)
  updatecertificate(@Body() data: GCreateCerticateDto, @Req() req: AuthReq) {
    return firstValueFrom(
      this.usersClient.send("updatecertificate", {
        ...data,
        studentid: req.user,
      }),
    );
  }




  @Post("updatetutorprofile")
  @UseGuards(AuthGuard)
  updatetutorprofile(@Body() data: GUpdateTutorDto, @Req() req: AuthReq) {
    return firstValueFrom(
      this.usersClient.send("updatetutorprofile", {
        ...data,
        userid: req.user,
      }),
    );
  }


    @Post("verifytutor")
  @UseGuards(AuthGuard)
  verifytutor( @Req() req: AuthReq) {
    return firstValueFrom(
      this.usersClient.send("verifytutor", {
        
        userid: req.user,
      }),
    );
  }

  @Post("toggleiscompleted")
  @UseGuards(AuthGuard)
  toggleiscompleted( @Body() data:GMakeCourseCompletedDto, @Req() req: AuthReq) {
    return firstValueFrom(
      this.usersClient.send("toggleiscompleted", {
        ...data,
        studentidid: req.user,
      }),
    );
  }

  


  


}
