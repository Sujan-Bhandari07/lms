import {
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
}
