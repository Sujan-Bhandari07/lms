import {
  CouseCompletionDto,
  CreateCourseDto,
  CUploadPartDto,
  GetAllStudentsDto,
  GetCourseTutorDto,
  GetSpecificCourseDto,
  ProvideRatingDto,
  SendCommentDto,
  UpdateStudentInCourseDto,
  UserCourseDto,
  VerifyCourseDto
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
  updateenrolled(@Payload() data:UserCourseDto){
     this.coursesService.updateenrolled(data)


  }

  @EventPattern("updatecompletion")
  updatecompletion(@Payload() data:UserCourseDto){
     this.coursesService.updatecompletion(data)


  }


   @MessagePattern("providecompletionoption")
  providecompletionoption(@Payload() data:CouseCompletionDto) {
    return this.coursesService.providecompletionoption(data);
  }



  @EventPattern("updateprofile")
  updateprofile(@Payload() data:UpdateStudentInCourseDto){
     this.coursesService.updateprofile(data)


  }

  @MessagePattern("getstudents")
  getallstudents(@Payload() data:GetAllStudentsDto){
    return this.coursesService.getallstudents(data)

  }


 @MessagePattern("getallcourse")
  getAllCourse(){

    return this.coursesService.getAllCourse()
  }


    @MessagePattern("getspecificcourse")
  getspecificcourse( @Payload() data:GetSpecificCourseDto){

    return this.coursesService.getspecificcourse(data)
  }


  


  
}
