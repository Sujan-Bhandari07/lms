import {
  CreateCourseDto,
  CUploadPartDto,
  GetCourseTutorDto,
  ProvideRatingDto,
  SendCommentDto,
  UserCourseDto,
  VerifyCourseDto,
  CouseCompletionDto
} from "@lms/shared";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly coursesService: AppService) {}

  @MessagePattern("createcourse")
  createcourse(@Payload() data: CreateCourseDto) {
    return this.coursesService.createcourse(data);
  }

  @MessagePattern("verifycourse")
  verifycourse(@Payload() data: VerifyCourseDto) {
    return this.coursesService.verifyCourse(data);
  }

  @MessagePattern("sendcomment")
  sendcomment(@Payload() data: SendCommentDto) {
    return this.coursesService.sendComment(data);
  }

  @MessagePattern("sendrating")
  sendrating(@Payload() data: ProvideRatingDto) {
    return this.coursesService.provideRating(data);
  }

  @MessagePattern("uploadpart")
  uploadpart(@Payload() data: CUploadPartDto) {
    return this.coursesService.uploadPart(data);
  }

  @MessagePattern("getcoursesbytutor")
  getcoursesbytutor(@Payload() data: GetCourseTutorDto) {
    return this.coursesService.getCoursesByTutor(data);
  }

  @EventPattern("updateenrolled")
  updateenrolled(data:UserCourseDto){
     this.coursesService.updateenrolled(data)


  }

  @EventPattern("updatecompletion")
  updatecompletion(data:UserCourseDto){
     this.coursesService.updatecompletion(data)


  }


   @MessagePattern("providecompletionoption")
  providecompletionoption(@Payload() data:CouseCompletionDto) {
    return this.coursesService.providecompletionoption(data);
  }


  
}
