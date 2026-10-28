import { CourseCertificateEmailDto, CourseEnrolledEmailDto, SignUpEmailDto, TutorCourseVerifiedEmailDto, TutorVerifiedEmailDto } from '@lms/shared';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly notificationService: AppService) {}

  @EventPattern("signupemaail")
  signupemail(data:SignUpEmailDto){
     this.notificationService.signupemail(data)

  }

   @EventPattern("courseenrolledemail")
  courseenrolledemail(data:CourseEnrolledEmailDto){
     this.notificationService.enrolledcourseemail(data)

  }

   @EventPattern("coursecertificateemail")
  coursecertificateemail(data:CourseCertificateEmailDto){
     this.notificationService.coursecertificateemail(data)

  }

   @EventPattern("verifiedtutoremail")
  verifiedtutoremail(data:TutorVerifiedEmailDto){
     this.notificationService.tutorverifiedemail(data)

  }
   @EventPattern("verifiedcourseemail")
  verifiedcourseemail(data:TutorCourseVerifiedEmailDto){
     this.notificationService.courseverifiedemail(data)

  }




}
