import {
  GetAllStudentsDto,
  GetAllTutorsDto,
  GetPublicUserProfilesDto,
  GetUserNotificationDto,
  LoginDto,
  LogoutDto,
  RegisterDto,
  UCreateCerticateDto,
  UMakeCourseCompletedDto,
  UUpdateEnrolledCourseDto,
  UUpdateTutorDto,
  UUpdateUserDto,
  VerifyTutorDto
} from "@lms/shared";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly userService: AppService) {}

  @MessagePattern("register")
  register(@Payload() data: RegisterDto) {
    return this.userService.register(data);
  }

  @MessagePattern("login")
  login(@Payload() data: LoginDto) {
    return this.userService.login(data);
  }

  @MessagePattern("logout")
  logout(@Payload() data: LogoutDto) {
    return this.userService.logout(data);
  }

  @MessagePattern("getprofile")
  getprofile(@Payload() data: LogoutDto) {
    return this.userService.getprofile(data);
  }

  @MessagePattern("updateprofile")
  updateprofile(@Payload() data: UUpdateUserDto) {
    return this.userService.updateprofile(data);
  }

  @MessagePattern("updateenrolledcourse")
  updateenrolledcourse(@Payload() data: UUpdateEnrolledCourseDto) {
    console.log(data)
    return this.userService.updateenrolledcourse(data);
  }

  @MessagePattern("updatecertificate")
  updatecertificate(@Payload() data:UCreateCerticateDto) {
    return this.userService.updatecertificates(data);
  }

  @MessagePattern("updatetutorprofile")
  updatetutorprofile(@Payload() data: UUpdateTutorDto) {
    return this.userService.UpdateTutorprofile(data);
  }

  @MessagePattern("verifytutor")
  verifytutor(@Payload() data: VerifyTutorDto) {
    return this.userService.verifyTutor(data);
  }

  @MessagePattern("toggleiscompleted")
  toggleiscompleted(@Payload() data: UMakeCourseCompletedDto) {
    return this.userService.makecousecomplete(data);
  }

  @MessagePattern("getstudents")
  getstudents(@Payload() data:GetAllStudentsDto){
return this.userService.getstudents(data)
  }

   @MessagePattern("getalltutors")
  getalltutors(@Payload() data:GetAllTutorsDto){
return this.userService.getalltutors(data)
  }

    @MessagePattern("gettutorstool")
  gettutorstool(){
return this.userService.gettutorstool()
  }

    @MessagePattern("getusernotification")
  getusernotification(@Payload() data:GetUserNotificationDto){
return this.userService.getusernotification(data)
  }

    @MessagePattern("getpendingtutors")
    getpendingtutors() {
      return this.userService.getPendingTutors();
    }

    @MessagePattern("getpublicuserprofiles")
    getpublicuserprofiles(@Payload() data: GetPublicUserProfilesDto) {
      return this.userService.getPublicUserProfiles(data);
    }

    @MessagePattern("chat.getParticipants")
    getchatparticipants(@Payload() data: { userids: string[] }) {
      return this.userService.getChatParticipants(data);
    }

    @MessagePattern("chat.getEligibleStudentsForTutor")
    getEligibleStudentsForTutor(
      @Payload() data: { tutorid: string; courseids: string[] },
    ) {
      return this.userService.getEligibleStudentsForTutor(data);
    }

    @MessagePattern("getenrolledcourses")
    getenrolledcourses(@Payload() data: { studentid: string }) {
      return this.userService.getEnrolledCourses(data);
    }

    @MessagePattern("enrollcourse")
    enrollcourse(@Payload() data: {
      studentid: string;
      courseid: string;
      paymentVerified?: boolean;
      developmentBypass?: boolean;
    }) {
      return this.userService.enrollCourse(data);
    }

    @MessagePattern("completeenrolledcourse")
    completeenrolledcourse(@Payload() data: { studentid: string; courseid: string }) {
      return this.userService.completeEnrolledCourse(data);
    }

    @MessagePattern("getcertificates")
    getcertificates(@Payload() data: { studentid: string }) {
      return this.userService.getCertificates(data);
    }

    @MessagePattern("gettutorprofile")
    gettutorprofile(@Payload() data: { userid: string }) {
      return this.userService.getTutorProfile(data);
    }


  
 
  


  
}
