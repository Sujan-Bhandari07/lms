import { BadRequestException, Body, Controller, Get, Inject, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '../guards/auth.guard';
import { CreateCourseDto, GetCourseTutorDto, GUploadPartDto, ProvideRatingDto, CouseCompletionDto,SendCommentDto, VerifyCourseDto } from '@lms/shared';
import { firstValueFrom } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller("courses")
@UseGuards(AuthGuard)
export class CourseController {
    constructor(
        @Inject("COURSES_SERVICE") private readonly coursesClient: ClientProxy,
      ) {}

      
 @Post("createcourse")
 createcourse(@Body() data:CreateCourseDto){
return firstValueFrom(this.coursesClient.send("createcourse",data))
 }

  @Post("verifycourse")
 verifycourse(@Body() data:VerifyCourseDto){
return firstValueFrom(this.coursesClient.send("verifycourse",data))
 }

  @Post("sendcomment")
 sendcomment(@Body() data:SendCommentDto){
return firstValueFrom(this.coursesClient.send("sendcomment",data))
 }

  @Post("sendrating")
 sendrating(@Body() data:ProvideRatingDto){
return firstValueFrom(this.coursesClient.send("sendrating",data))
 }

 @Post("providecompletionoption")
 providecompletionoption(@Body() data:CouseCompletionDto){
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
 uploadpart(@Body() data:GUploadPartDto,
@UploadedFile() file:Express.Multer.File){

    const buffer=file?.buffer.toString("base64")
return firstValueFrom(this.coursesClient.send("uploadpart",{...data,videourl:buffer}))
 }



  @Get("getcoursesbytutor")
 getcoursesbytutor(@Query() data:GetCourseTutorDto){
return firstValueFrom(this.coursesClient.send("getcoursesbytutor",data))
 }






 



 
}
