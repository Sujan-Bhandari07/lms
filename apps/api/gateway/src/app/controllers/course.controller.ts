import { BadRequestException, Body, Controller, ForbiddenException, Get, Inject, Post, Query, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '../guards/auth.guard';
import { AuthReq, CreateCourseDto, GetCourseTutorDto, GUploadPartDto, ProvideRatingDto, CouseCompletionDto,SendCommentDto, VerifyCourseDto, GetAllStudentsDto, GCreateCourseDto } from '@lms/shared';
import { firstValueFrom } from 'rxjs';
import { instrumentRmqClient } from "@lms/filters";
import { FileInterceptor } from '@nestjs/platform-express';

interface SessionProfile {
  role: "student" | "tutor" | "admin";
}

interface ApiEnvelope<T> {
  success: boolean;
  payload?: T;
}

@Controller("courses")
@UseGuards(AuthGuard)
export class CourseController {
    constructor(
        @Inject("COURSES_SERVICE") private readonly coursesClient: ClientProxy,
        @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
      ) {
        this.coursesClient = instrumentRmqClient(this.coursesClient, "courses");
        this.usersClient = instrumentRmqClient(this.usersClient, "users");
      }

      
 @Post("createcourse")
  @UseInterceptors(
  FileInterceptor('photo', {
    limits: {
      fileSize: 500 * 1024 * 1024, // 500 MB
    },
    fileFilter: (_req, file, cb) =>
      file.mimetype.startsWith('image/')
        ? cb(null, true)
        : cb(
            new BadRequestException('Only image files are allowed'),
            false,
          ),
  }),
)
 async createcourse(@Body() data:GCreateCourseDto,
@UploadedFile() file:Express.Multer.File,
@Req() req: AuthReq){
  await this.requireRole(req.user, "tutor");
  const buffer= file.buffer.toString("base64")
return firstValueFrom(this.coursesClient.send("createcourse",{...data,title:buffer}))
 }

  @Post("verifycourse")
 async verifycourse(@Body() data:VerifyCourseDto, @Req() req: AuthReq){
    const profile = await this.sessionProfile(req.user);
    if (profile.role !== "admin") {
      throw new ForbiddenException("An admin account is required.");
    }
    return firstValueFrom(this.coursesClient.send("verifycourse",data))
 }

  @Post("sendcomment")
 async sendcomment(@Body() data:SendCommentDto, @Req() req: AuthReq){
await this.requireRole(req.user, "student");
return firstValueFrom(this.coursesClient.send("sendcomment",data))
 }

  @Post("sendrating")
 async sendrating(@Body() data:ProvideRatingDto, @Req() req: AuthReq){
await this.requireRole(req.user, "student");
return firstValueFrom(this.coursesClient.send("sendrating",data))
 }

 @Post("providecompletionoption")
 async providecompletionoption(@Body() data:CouseCompletionDto, @Req() req: AuthReq){
await this.requireRole(req.user, "tutor");
return firstValueFrom(this.coursesClient.send("providecompletionoption",data))
 }



 

  @Post("uploadpart")
 @UseInterceptors(
  FileInterceptor('part', {
    limits: {
      fileSize: 500 * 1024 * 1024, // 500 MB
    },
    fileFilter: (_req, file, cb) =>
      file.mimetype.startsWith('video/')
        ? cb(null, true)
        : cb(
            new BadRequestException('Only video files are allowed'),
            false,
          ),
  }),
)
 async uploadpart(@Body() data:GUploadPartDto,
@UploadedFile() file:Express.Multer.File,
@Req() req: AuthReq){

    await this.requireRole(req.user, "tutor");
    const buffer=file?.buffer.toString("base64")
return firstValueFrom(this.coursesClient.send("uploadpart",{...data,videourl:buffer}))
 }










  @Get("getcoursesbytutor")
 async getcoursesbytutor(@Query() data:GetCourseTutorDto, @Req() req: AuthReq){
await this.requireRole(req.user, "tutor");
return firstValueFrom(this.coursesClient.send("getcoursesbytutor",data))
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

 private async requireRole(token: string, role: SessionProfile["role"]) {
   const profile = await this.sessionProfile(token);
   if (profile.role !== role) {
     throw new ForbiddenException(`A ${role} account is required.`);
   }
 }





 



 
}
